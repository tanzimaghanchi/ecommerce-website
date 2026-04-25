import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders storefront navigation", () => {
  render(<App />);
  expect(screen.getByText(/FAISHORA/i)).toBeInTheDocument();
  expect(screen.getByText(/Categories/i)).toBeInTheDocument();
  expect(screen.getByText(/Wishlist/i)).toBeInTheDocument();
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
});
