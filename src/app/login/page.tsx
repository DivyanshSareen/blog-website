"use client";

import { FormEvent } from "react";

export default function Login() {
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/submit", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
  }
  return (
    <form onSubmit={onSubmit}>
      <input type="text" name="user-id" />
      <input type="password" name="password" />
      <button type="submit">Submit</button>
    </form>
  );
}
