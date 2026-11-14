import { act, renderHook } from "@testing-library/react-native";
import type { Catalog, CatalogSnapshot } from "@melodify/catalog";

import { useCatalog } from "../useCatalog";

/**
 * El contador de cambios de C5 (NFR8.5): la primera emisión no cuenta —es el estado
 * que las tarjetas ya pintaron— y cada cambio posterior sube uno.
 */
interface CatalogDouble {
  catalog: Catalog;
  emit: () => void;
  unsubscribe: jest.Mock;
}

function catalogDouble(): CatalogDouble {
  const listeners = new Set<(snapshot: CatalogSnapshot) => void>();
  const unsubscribe = jest.fn();

  const catalog = {
    subscribe: jest.fn((listener: (snapshot: CatalogSnapshot) => void) => {
      listeners.add(listener);
      // Emisión inmediata, como la del catálogo real al establecerse.
      listener({ works: [], coverFailure: false });
      return () => {
        listeners.delete(listener);
        unsubscribe();
      };
    }),
  } as unknown as Catalog;

  return {
    catalog,
    emit: () => {
      for (const listener of [...listeners]) {
        listener({ works: [], coverFailure: true });
      }
    },
    unsubscribe,
  };
}

describe("useCatalog", () => {
  it("la primera emisión no incrementa el contador", () => {
    const double = catalogDouble();

    const { result } = renderHook(() => useCatalog(double.catalog));

    expect(result.current).toBe(0);
  });

  it("cada cambio del catálogo sube el contador", () => {
    const double = catalogDouble();

    const { result } = renderHook(() => useCatalog(double.catalog));

    act(() => {
      double.emit();
    });

    expect(result.current).toBe(1);

    act(() => {
      double.emit();
    });

    expect(result.current).toBe(2);
  });

  it("al desmontar deja la suscripción", () => {
    const double = catalogDouble();

    const { unmount } = renderHook(() => useCatalog(double.catalog));
    unmount();

    expect(double.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
