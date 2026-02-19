# n8n-nodes-bcra

> **Disclaimer**: This is a community project and is **NOT** an official node provided by the Banco Central de la República Argentina (BCRA). This node consumes the public API provided by BCRA.

This is an n8n community node. It lets you query the [BCRA Statistics API v4.0](https://www.bcra.gob.ar/) in your n8n workflows.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Compatibility](#compatibility)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### BCRA Statistics

Query statistical variables from the Central Bank of Argentina.

- **Variable**: Select the statistical variable to query from the dropdown list (e.g., "Reservas Internacionales", "Tipo de Cambio", etc.).
- **Start Date**: Optional. Filter results starting from this date (YYYY-MM-DD).
- **End Date**: Optional. Filter results up to this date (YYYY-MM-DD).
- **Limit**: Max number of results to return (default: 100).
- **Offset**: Number of results to skip (default: 0).

The node injects the variable description into each result item for easier identification.

## Credentials

This node does not require authentication to use the public BCRA API.

## Compatibility

- n8n v0.1.0+

## License

MIT

## Repository

https://github.com/hernanjh/n8n-nodes-bcra
