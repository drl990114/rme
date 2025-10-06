export interface AIOptions {
  defaultSelectProvider?: string

  supportProviderInfosMap: Record<
    string,
    {
      models: string[]
    }
  >

  generateText: (options: {
    provider: string
    model: string
    prompt: string
    temperature?: number
  }) => Promise<string | null>
}
