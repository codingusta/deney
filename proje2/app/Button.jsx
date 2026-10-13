"use client";

import { Slot } from "@radix-ui/react-slot";

export default function Button({ asChild = false, className = "", ...props }) {
  const Component = asChild ? Slot : "button";
  return <Component className={`ui-button ${className}`.trim()} {...props} />;
}
