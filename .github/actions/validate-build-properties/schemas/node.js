const node = z.object({ 
  project: z.object({
    name: z.string(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, {
      message: "Version must be in x.x.x format",
    }),
    registry: z.string().default("ghcr.io/nicholas-moniz"),
    test: z
      .object({
        config: z.string().default("jest.config.js"),
        directory: z.string().default("."),
        args: z.string().default(""),
      })
      .partial()
      .default({}),
    docker: z
      .object({
        dockerfile: z.string().default("dockerfile"),
        context: z.string().default("."),
        buildArgs: z.record(z.string()).default({}),
        buildCommandArgs: z.string().default(""),
      })
      .partial()
      .default({}),
    helm: z
      .object({
        chartPath: z.string().default("helm"),
        namespace: z.string().default("default"),
      })
      .partial()
      .default({}),
  }),
  overrides: z
    .object({
      releaseBranch: z.boolean().default(false),
      skipUnitTests: z.boolean().default(false),
      autoIncrementVersion: z.boolean().default(true),
      publishDockerImage: z.boolean().default(true),
      publishHelmChart: z.boolean().default(true),
      deployToCluster: z.boolean().default(true),
    })
    .partial()
    .default({}),
});

module.exports = { node };
