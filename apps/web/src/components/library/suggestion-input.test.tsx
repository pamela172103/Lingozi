import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

import { SuggestionInput } from "./suggestion-input";

const options = [{ value: "từ bỏ", detail: "Từ từ điển" }, { value: "bỏ rơi" }];
function Field({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState("");
  return (
    <>
      <label htmlFor="meaning">Nghĩa</label>
      <SuggestionInput
        id="meaning"
        value={value}
        options={options}
        listLabel="Gợi ý nghĩa"
        multiline
        rows={2}
        disabled={disabled}
        onChange={setValue}
        onPick={(index) => setValue(options[index]!.value)}
      />
    </>
  );
}

it("opens under the focused input, picks by mouse, closes, and stays editable", () => {
  render(<Field />);
  const input = screen.getByLabelText("Nghĩa");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  fireEvent.focus(input);
  expect(input).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("option", { name: /từ bỏ/u })).toHaveTextContent("Từ từ điển");
  fireEvent.mouseDown(screen.getByRole("option", { name: /từ bỏ/u }));
  fireEvent.click(screen.getByRole("option", { name: /từ bỏ/u }));
  expect(input).toHaveValue("từ bỏ");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  fireEvent.change(input, { target: { value: "từ bỏ, ngừng lại" } });
  expect(input).toHaveValue("từ bỏ, ngừng lại");
});

it("supports arrow navigation, Enter selection and Escape without changing typed content", () => {
  render(<Field />);
  const input = screen.getByLabelText("Nghĩa");
  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: "ArrowUp" });
  expect(screen.getByRole("option", { name: "bỏ rơi" })).toHaveAttribute("aria-selected", "true");
  expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "bỏ rơi" }).id);
  fireEvent.keyDown(input, { key: "Enter" });
  expect(input).toHaveValue("bỏ rơi");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Escape" });
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  expect(input).toHaveValue("bỏ rơi");
});

it("closes on blur and shows no list when disabled or empty", () => {
  const { rerender } = render(<Field />);
  const input = screen.getByLabelText("Nghĩa");
  fireEvent.focus(input);
  fireEvent.blur(input);
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  rerender(<Field disabled />);
  expect(input).toBeDisabled();
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  rerender(<SuggestionInput options={[]} listLabel="Gợi ý" onChange={() => {}} onPick={() => {}} />);
  fireEvent.focus(screen.getByRole("combobox"));
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});
