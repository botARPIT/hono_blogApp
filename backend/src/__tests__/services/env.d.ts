declare module "cloudflare:test" {
  // ProvidedEnv controls the type of `import("cloudflare:test").env`
  interface ProvidedEnv extends Env {

  }

  // SELF binding for integration testing
  export const SELF: {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
  }
}