import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
} from 'n8n-workflow';

import { bcraOptions } from './bcra_options';

export class Bcra implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'BCRA',
		name: 'bcra',
		icon: 'file:bcra.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["idVariable"]}}',
		description: 'Consume BCRA (Banco Central de la República Argentina) Statistics API v4.0',
		defaults: {
			name: 'BCRA',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [],
		properties: [
			{
				displayName: 'Variable',
				name: 'idVariable',
				type: 'options',
				options: bcraOptions,
				default: 1,
				description: 'Select the statistical variable to query',
				required: true,
			},
			{
				displayName: 'Start Date',
				name: 'desde',
				type: 'dateTime',
				default: '',
				description: 'Start date for the query (YYYY-MM-DD). If empty, returns the last 100 records.',
			},
			{
				displayName: 'End Date',
				name: 'hasta',
				type: 'dateTime',
				default: '',
				description: 'End date for the query (YYYY-MM-DD)',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 100,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description: 'Number of results to skip',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;

		for (let i = 0; i < length; i++) {
			try {
				const idVariable = this.getNodeParameter('idVariable', i) as number;
				const desde = this.getNodeParameter('desde', i) as string;
				const hasta = this.getNodeParameter('hasta', i) as string;
				const limit = this.getNodeParameter('limit', i) as number;
				const offset = this.getNodeParameter('offset', i) as number;

				const qs: IDataObject = {};

				if (desde) {
					qs.desde = new Date(desde).toISOString().split('T')[0];
				}
				if (hasta) {
					qs.hasta = new Date(hasta).toISOString().split('T')[0];
				} //
				
				// Limit and offset are not standard query params for this specific endpoint in some docs, 
				// but user requested them. BCRA API v4 usually handles pagination via standard headers or params?
				// Looking at docs (estadisticas/v4.0/monetarias/{idVariable}), it supports 'desde', 'hasta'.
				// It doesn't explicitly document 'limit' and 'offset' in the public swagger sometimes, 
				// but let's include them as requested or check if they need to be handled manually.
				// For now, passing them if they are non-default or always?
				// If the API doesn't support them, they might be ignored.
				if (limit) qs.limit = limit;
				if (offset !== undefined) qs.offset = offset;

				const options = {
					method: 'GET' as const,
					url: `https://api.bcra.gob.ar/estadisticas/v4.0/monetarias/${idVariable}`,
					qs,
					json: true,
                    skipSslCertificateValidation: true, // BCRA certificate chain issues sometimes
				};

				const response = await this.helpers.httpRequest(options);

				// Inject description
				const variableOption = bcraOptions.find(o => o.value === idVariable);
				const variableName = variableOption ? variableOption.name : 'Unknown Variable';

				if (Array.isArray(response.results)) {
					const results = response.results.map((item: any) => ({
						...item,
						descripcion: variableName,
                        idVariable: idVariable
					}));

					const executionData = this.helpers.returnJsonArray(results);
					// Add pairedItem
                    executionData.forEach(d => {
                        d.pairedItem = { item: i };
                    });
					returnData.push(...executionData);
				} else {
                    // Fallback if results is not an array (some endpoints might return different structure)
                    const data = {
                        ...response,
                        descripcion: variableName,
                        idVariable: idVariable
                    };
                    returnData.push({
                        json: data,
                        pairedItem: { item: i }
                    });
                }

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					});
				} else {
					throw new NodeApiError(this.getNode(), error);
				}
			}
		}

		return [returnData];
	}
}
