import { fireEvent, render, screen } from "@testing-library/react-native";

import { ArtistResultRow } from "../components/ArtistResultRow";
import { ThemeProvider } from "../ThemeProvider";

describe("ArtistResultRow", () => {
  it("pinta el artista, su rótulo y el bloque circular con la inicial", () => {
    render(
      <ThemeProvider scheme="light">
        <ArtistResultRow
          artist={{ artistId: "artist1", name: "bad bunny" }}
          onPress={jest.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("artist-result-name")).toHaveTextContent(
      "bad bunny",
    );
    expect(screen.getByTestId("artist-result-kind")).toHaveTextContent("Artista");
    expect(screen.getByText("B")).toBeOnTheScreen();
    expect(screen.getByTestId("artist-result-avatar")).toHaveStyle({
      width: 56,
      height: 56,
    });
  });

  it("toda la fila es el objetivo táctil", () => {
    const onPress = jest.fn();

    render(
      <ThemeProvider scheme="light">
        <ArtistResultRow
          artist={{ artistId: "artist1", name: "bad bunny" }}
          onPress={onPress}
        />
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByTestId("artist-result-artist1"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
