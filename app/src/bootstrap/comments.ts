/**
 * La **única** instancia del controlador de comentarios de la app (TS-18, R-01).
 *
 * Por qué vive aquí y no dentro de la cáscara: la hoja se monta en C2, pero quien
 * lee y escribe es C4 con la identidad de C3, y ninguna de esas dos cosas puede
 * construirse dos veces. Una segunda instancia daría dos estados para la misma
 * hoja —una lista que no se actualiza, un error de envío que no se ve—. La cáscara
 * solo conoce el contrato `ShellServices.comments`.
 *
 * Se construye al importar el módulo, como el resto de instancias del arranque
 * (`instances.ts`, `session.ts`), y las pruebas sustituyen el módulo con
 * `jest.mock` (NFR1.8).
 */
import { createCommentsController } from "../comments";
import { contentStore } from "./instances";
import { appSession } from "./session";

export const commentsController = createCommentsController({
  content: contentStore,
  session: appSession,
});
