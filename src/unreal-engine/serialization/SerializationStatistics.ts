export class SerializationStatistics {
  constructor(
    public readonly extraBytes: number | null,
    public readonly error: string | null,
  ) {}
}
