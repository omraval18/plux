import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
    config: {
        logLevel: "Debug",
    },
});

export const runtime = "nodejs";
