import { describe, it, expect } from 'vitest'
import { SELF } from "cloudflare:test"

describe("health endpoint tests", () => {
    it("should return 200 and ok status", async () => {
        const res = await SELF.fetch("http://localhost/health")

        expect(res.status).toBe(200)

        const body = await res.json() as { status: string; timestamp: string }
        expect(body.status).toBe("ok")
        expect(body.timestamp).toBeDefined()
    })
})
