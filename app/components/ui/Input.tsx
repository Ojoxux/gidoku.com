import type { FC } from "hono/jsx";

interface InputProps {
  type?: "text" | "email" | "password" | "number" | "search";
  name: string;
  id?: string;
  placeholder?: string;
  value?: string | number;
  required?: boolean;
  disabled?: boolean;
  class?: string;
}

export const Input: FC<InputProps> = ({
  type = "text",
  name,
  id,
  placeholder,
  value,
  required = false,
  disabled = false,
  class: className = "",
}) => {
  return (
    <input
      type={type}
      name={name}
      id={id ?? name}
      placeholder={placeholder}
      value={value}
      required={required}
      disabled={disabled}
      class={`w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-100 disabled:cursor-not-allowed text-zinc-900 placeholder-zinc-400 transition-shadow ${className}`}
    />
  );
};

interface TextareaProps {
  name: string;
  id?: string;
  placeholder?: string;
  value?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  class?: string;
}

export const Textarea: FC<TextareaProps> = ({
  name,
  id,
  placeholder,
  value,
  rows = 4,
  required = false,
  disabled = false,
  class: className = "",
}) => {
  return (
    <textarea
      name={name}
      id={id ?? name}
      placeholder={placeholder}
      rows={rows}
      required={required}
      disabled={disabled}
      class={`w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-100 disabled:cursor-not-allowed resize-vertical text-zinc-900 placeholder-zinc-400 transition-shadow ${className}`}
    >
      {value}
    </textarea>
  );
};

interface LabelProps {
  for: string;
  required?: boolean;
  class?: string;
}

export const Label: FC<LabelProps & { children: any }> = ({
  for: htmlFor,
  required = false,
  class: className = "",
  children,
}) => {
  return (
    <label
      for={htmlFor}
      class={`block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide ${className}`}
    >
      {children}
      {required && <span class="text-red-500 ml-1">*</span>}
    </label>
  );
};
