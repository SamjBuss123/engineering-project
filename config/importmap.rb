# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from 'app/javascript/controllers', under: 'controllers'

#config/importmap.rb
pin "react", to: "https://ga.jspm.io/npm:react@19.1.1/index.js"
pin "react-dom", to: "https://ga.jspm.io/npm:react-dom@19.1.1/index.js"
pin "react-dom/client", to: "https://ga.jspm.io/npm:react-dom@19.1.1/client.js"
pin "scheduler", to: "https://ga.jspm.io/npm:scheduler@0.23.0/index.js"
pin "react/jsx-runtime", to: "https://ga.jspm.io/npm:react@19.1.1/jsx-runtime.js"

pin "htm", to: "https://ga.jspm.io/npm:htm@3.1.1/dist/htm.js" # Optional, for JSX-like syntax without transpilation

pin_all_from "app/javascript/components", under: "components"