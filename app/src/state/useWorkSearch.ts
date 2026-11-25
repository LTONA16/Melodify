/**
 * La búsqueda de obra de Crear (BR13.1–BR13.5): el único sitio donde se aplican los
 * 2 caracteres y los 400 ms, y donde una respuesta que llega tarde se descarta.
 *
 * Por qué vive en un hook y no en la pantalla: la vista pinta estados y no temporiza
 * (BR13.1), y el catálogo llega por argumento para que la instancia única siga siendo
 * la del punto de composición (R-01) y la prueba pueda pasar un puerto doble.
 *
 * Decisiones:
 * - **La consulta que se compara está normalizada** (`trim` y espacios colapsados):
 *   un espacio de más al final no reinicia la espera ni repite una petición que C5
 *   resolvería de caché. El texto del campo sigue siendo lo que la persona escribió.
 * - **El temporizador vive en el efecto**: cada cambio de consulta limpia el anterior
 *   con la función de baja, así que nunca hay dos esperas vivas.
 * - **Las respuestas tardías se descartan por número de petición**, no por comparar
 *   el texto: `setQuery` y `clear` invalidan en el acto, antes de que el efecto vuelva
 *   a correr, para que una promesa que resuelve en ese hueco tampoco se pinte.
 * - **`offline` y `error` no son lo mismo** (BR17.7, BR17.10): un fallo de red es un
 *   estado previsto y no se registra; un `error` es un fallo que el puerto devolvió y
 *   cuya causa ya registró C7 con `SPOTIFY_SEARCH_FAILED` y su código HTTP. La app
 *   solo escribe `SEARCH_PORT_UNAVAILABLE` cuando la llamada al puerto lanza, que es
 *   el único defecto interno que puede ver (NFR9.6); el mensaje es literal y nunca
 *   lleva la consulta ni el texto de nadie (NFR4.6).
 * - **`rateLimited` tiene su propio estado**: un `429` de Spotify es temporal y se
 *   resuelve esperando. Pintarlo como `error` invitaba a reconectar cuando la sesión
 *   estaba perfectamente viva, y registraba un defecto del puerto que no existía.
 * - **Con `enabled` falso no se monta nada**: ni temporizador ni llamada, y el estado
 *   vuelve a `idle`. Es la rama «sin Spotify» de BR13.5, que ni siquiera pinta el
 *   buscador.
 * - **`paused` es la capa de token caído de Explorar** (BR18.6): no pide ni cambia
 *   el estado vigente, para que la lista y la consulta que ya estaban en pantalla
 *   sobrevivan al `401`. Al levantarse la capa no se revalida nada: la consulta
 *   queda escrita y la siguiente petición la dispara una acción de la persona, que
 *   es lo que pide F25 («Los resultados anteriores no se revalidan solos»).
 */
import type { Catalog, WorkView } from "@melodify/catalog";
import type { ArtistSummary } from "@melodify/design-system";
import { useCallback, useEffect, useRef, useState } from "react";

import { logger, type AppLogger } from "../bootstrap/logger";

export type WorkSearchStatus =
  | "idle"
  | "short"
  | "searching"
  | "results"
  | "empty"
  | "error"
  | "offline"
  | "rateLimited";

export interface WorkSearchOptions {
  /**
   * Explorar pide artistas además de obras; Crear no, porque un artista no se
   * puede elegir como obra (BR20.6). Por defecto se apaga.
   */
  includeArtists?: boolean;
  /**
   * La capa de token caído de Explorar (BR18.6) y la reconexión mientras dura
   * `connecting`: no lanza peticiones ni toca el estado vigente, pero deja
   * escribir en el campo. Al volver a `false` no se busca sola: Explorar no
   * revalida lo que ya estaba en pantalla, así que la siguiente petición nace de
   * una acción de la persona (escribir, limpiar o «Reintentar»).
   */
  paused?: boolean;
}

export interface WorkSearchState {
  /** Lo que hay escrito en el campo, tal cual. */
  query: string;
  status: WorkSearchStatus;
  /** Solo con `results`; en el resto de estados siempre vacío. */
  results: WorkView[];
  /** Artistas encontrados; solo con `includeArtists` y en `results`. */
  artists: ArtistSummary[];
  setQuery: (text: string) => void;
  /** Vacía el campo, cancela la espera y vuelve al estado inicial sin pedir nada. */
  clear: () => void;
  /** Repite la consulta vigente, con el mismo disparo que al escribir. */
  retry: () => void;
}

/** Los 400 ms desde la última pulsación (BR13.1). */
export const SEARCH_DEBOUNCE_MS = 400;

/** Los 2 caracteres que convierten una consulta en buscable (BR13.1). */
export const SEARCH_MIN_LENGTH = 2;

/** `trim` más espacios colapsados: la misma clave que usa la caché de C5. */
function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

export function useWorkSearch(
  catalog: Catalog,
  enabled: boolean,
  log: AppLogger = logger,
  options: WorkSearchOptions = {},
): WorkSearchState {
  const includeArtists = options.includeArtists ?? false;
  const paused = options.paused ?? false;
  const pausedRef = useRef(paused);
  const [query, setQueryState] = useState("");
  const [status, setStatus] = useState<WorkSearchStatus>("idle");
  const [results, setResults] = useState<WorkView[]>([]);
  const [artists, setArtists] = useState<ArtistSummary[]>([]);
  // El número de la petición vigente. Sube al escribir, al limpiar, al reintentar y
  // al disparar; una respuesta con otro número ya no interesa. Es un `ref` y no un
  // estado porque invalidar no debe repintar nada por sí mismo.
  const requestRef = useRef(0);
  // Reintentar no cambia la consulta: este contador es lo que vuelve a disparar el
  // efecto sin tocar el texto del campo.
  const [attempt, setAttempt] = useState(0);
  // Tras una capa de pausa (token caído o reconexión), la búsqueda no se relanza
  // sola al volver `enabled`: se espera a que la persona escriba, limpie o pulse
  // «Reintentar». Sin esto, volver de `invalidToken` a `connected` revalidaría la
  // lista que F25 manda conservar.
  const resumeRequiredRef = useRef(false);

  // La clave del efecto es la consulta normalizada, no el texto tal cual: un espacio
  // de más al final no reinicia la espera ni repite una petición que C5 ya cacheó.
  const normalized = normalizeQuery(query);

  useEffect(() => {
    // El `run` que ya salió a la red no se reejecuta con el render: lee la capa por
    // referencia desde el efecto para descartar su resultado si el token cayó
    // mientras esperaba.
    pausedRef.current = paused;

    if (paused) {
      // Token caído o reconectando: ni se pide ni se limpia lo que la persona ya
      // estaba leyendo. Al levantar la capa, la búsqueda espera una acción.
      resumeRequiredRef.current = true;
      return undefined;
    }

    if (resumeRequiredRef.current) {
      // La pausa terminó: se conserva consulta, lista y estado, y no se revalida
      // nada por cuenta propia (F25, BR18.6).
      return undefined;
    }

    if (!enabled) {
      // Sin buscador montado no hay nada que esperar ni que pedir (BR13.5).
      requestRef.current += 1;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("idle");
      setResults([]);
      setArtists([]);
      return undefined;
    }

    if (normalized === "") {
      requestRef.current += 1;
      setStatus("idle");
      setResults([]);
      setArtists([]);
      return undefined;
    }

    if (normalized.length < SEARCH_MIN_LENGTH) {
      // «Escribe al menos 2 caracteres.» sin llegar a pedir nada (BR13.1).
      requestRef.current += 1;
      setStatus("short");
      setResults([]);
      setArtists([]);
      return undefined;
    }

    const id = requestRef.current + 1;
    requestRef.current = id;
    setStatus("searching");
    setResults([]);
    setArtists([]);

    const run = async (): Promise<void> => {
      let result: Awaited<ReturnType<Catalog["searchWorks"]>>;

      try {
        result = await catalog.searchWorks(normalized);
      } catch {
        if (id !== requestRef.current || pausedRef.current) {
          // La capa de token caído también descarta el fallo del puerto.
          return;
        }
        // Un puerto que falta o que lanza es un defecto interno, no un estado del
        // contrato: se registra y se pinta el error con «Reintentar».
        log.warn(
          "SEARCH_PORT_UNAVAILABLE",
          "la búsqueda no pudo ejecutarse: el puerto falló o no está",
        );
        setStatus("error");
        setResults([]);
        setArtists([]);
        return;
      }

      if (id !== requestRef.current || pausedRef.current) {
        // Llegó tarde para una consulta que ya no es la vigente (BR13.4) o el
        // token cayó mientras esperaba: no se pinta ni se declara `results`.
        return;
      }

      const foundArtists: ArtistSummary[] = includeArtists
        ? (result.artists ?? []).map((artist) => ({
            artistId: artist.artistId,
            name: artist.name,
          }))
        : [];

      if (
        result.status === "ok" &&
        (result.works.length > 0 || foundArtists.length > 0)
      ) {
        setStatus("results");
        setResults(result.works);
        setArtists(foundArtists);
        return;
      }

      if (result.status === "ok" || result.status === "empty") {
        setStatus("empty");
        setResults([]);
        setArtists([]);
        return;
      }

      if (result.status === "offline") {
        // Sin red es un estado previsto, no un error interno: no se registra y la
        // vista puede pintar su banner propio (BR17.7, BR17.10).
        setStatus("offline");
        setResults([]);
        setArtists([]);
        return;
      }

      if (result.status === "rateLimited") {
        // La cuota de Spotify es temporal y se resuelve esperando, no reconectando:
        // se pinta con su propio mensaje y «Reintentar», sin tocar el token
        // (BR17.6, BR20.7). Tampoco es un defecto del puerto, así que no se registra.
        setStatus("rateLimited");
        setResults([]);
        setArtists([]);
        return;
      }

      if (result.status === "error") {
        // Un `error` es un fallo que el puerto devolvió —400, 5xx, timeout— y su
        // causa ya la registró C7 con `SPOTIFY_SEARCH_FAILED` y el código HTTP. La
        // app solo registra `SEARCH_PORT_UNAVAILABLE` cuando la llamada al puerto
        // lanza, que es el único defecto interno que puede ver (NFR9.6).
        setStatus("error");
        setResults([]);
        setArtists([]);
        return;
      }

      setStatus("error");
      setResults([]);
      setArtists([]);
    };

    const timer = setTimeout(() => {
      void run();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
    // `attempt` es la clave del reintento: cambiarlo vuelve a programar la búsqueda
    // sin tocar la consulta escrita.
  }, [normalized, enabled, paused, attempt, catalog, log, includeArtists]);

  const setQuery = useCallback((text: string) => {
    // Invalida la petición en vuelo antes del siguiente render: si su promesa
    // resuelve en ese hueco, ya no se pinta (BR13.4).
    requestRef.current += 1;
    // Escribir es la acción que vuelve a habilitar la búsqueda tras una pausa.
    resumeRequiredRef.current = false;
    setQueryState(text);
  }, []);

  const clear = useCallback(() => {
    requestRef.current += 1;
    resumeRequiredRef.current = false;
    setQueryState("");
    setStatus("idle");
    setResults([]);
    setArtists([]);
  }, []);

  const retry = useCallback(() => {
    // «Reintentar» es una acción explícita: también levanta la espera de la pausa.
    resumeRequiredRef.current = false;
    setAttempt((previous) => previous + 1);
  }, []);

  return { query, status, results, artists, setQuery, clear, retry };
}
