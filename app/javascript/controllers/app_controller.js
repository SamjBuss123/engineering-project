import { Controller } from "@hotwired/stimulus"
import React from "react"
import { createRoot } from 'react-dom/client';
import App from "components/App"

export default class extends Controller {
  connect() {
    console.log("Connected");

    const e = React.createElement;
    const root = createRoot(document.getElementById("root"));
    root.render(e(App), root);
  }
}
