import { useEffect, useRef, useState } from "react";
import style from "./select.module.css";

export type SelectOptions = {
  label: string;
  value: string | number;
};

type MultipleSelectOptions = {
  multiple: true;
  value: SelectOptions[];
  onChange: (value: SelectOptions[]) => void;
};

type SingleSelectProps = {
  multiple?: false;
  value?: SelectOptions;
  onChange: (value: SelectOptions | undefined) => void;
};
type SelectProps = {
  options: SelectOptions[];
} & (SingleSelectProps | MultipleSelectOptions);

export function Select({ multiple, value, onChange, options }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  function clearOption() {
    multiple ? onChange([]) : onChange(undefined);
  }

  function selectOptions(option: SelectOptions) {
    if (multiple) {
      if (value.includes(option)) {
        onChange(value.filter((o) => o !== option));
      } else {
        onChange([...value, option]);
      }
    } else {
      if (option !== value) onChange(option);
    }
  }

  function isSelectOptions(option: SelectOptions) {
    return multiple ? value.includes(option) : option === value;
  }

  useEffect(() => {
    if (open) setHighlightedIndex(0);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target != containerRef.current) return;
      switch (e.code) {
        case "Enter":
        case "Space":
          setOpen((prev) => !prev);
          if (open) selectOptions(options[highlightedIndex]);
          break;

        case "ArrowUp":
        case "ArrowDown":
          {
            if (!open) {
              setOpen(true);
              break;
            }

            const newValue =
              highlightedIndex + (e.code === "ArrowDown" ? 1 : -1);

            if (newValue >= 0 && newValue < options.length) {
              setHighlightedIndex(newValue);
            } 
            break;
          }

          case "Escape" : 
          setOpen(false);
          break;
      }
    };
    containerRef.current?.addEventListener("keydown", handler);

    return () => {
      containerRef.current?.removeEventListener("keydown", handler);
    };
  }, [open, highlightedIndex, options]);
  return (
    <div
      ref={containerRef}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((open) => !open)}
      tabIndex={0}
      className={style.container}
    >
      <span className={style.value}>
        {multiple
          ? value.map((v) => (
              <button
                key={v.value}
                className={style["option-badge"]}
                onClick={(e) => {
                  e.stopPropagation();
                  selectOptions(v);
                }}
              >
                {v.label}
                <span className={style["remove_btn"]}>&times;</span>
              </button>
            ))
          : value?.label}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation(), clearOption();
        }}
        className={style["clear_btn"]}
      >
        &times;
      </button>
      <div className={style.divider}></div>
      <div className={style.caret}></div>
      <ul className={`${style.options} ${open ? style.show : ""}`}>
        {options.map((option, index) => (
          <li
            onClick={(e) => {
              e.stopPropagation();
              selectOptions(option);
              setOpen(false);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            key={option.value}
            className={`${style.option} 
            ${isSelectOptions(option) ? style.selected : ""}
            ${index == highlightedIndex ? style.highlighted : ""}
            `}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
