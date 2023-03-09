import {INodeExecutionData, INodeParameters, INodeType, INodeTypeDescription} from 'n8n-workflow';
import {IExecuteFunctions} from 'n8n-core';

export class SqlPlaceholder implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SQL Placeholder',
		name: 'sqlPlaceholder',
		group: ['transform'],
		version: 1,
		description: 'SQL Placeholder Node',
		defaults: {
			name: 'SQL Placeholder Node',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Sql',
				name: 'sql',
				type: 'string',
				default: '',
				placeholder: 'SELECT * FROM table WHERE id = ?',
				description: 'The SQL query with placeholders',
			},
			// 追加できるやつ
			{
				displayName: 'Values to Set',
				name: 'values',
				placeholder: 'Add Value',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: false,
				},
				description: 'The value to set',
				default: {},
				options: [
					{
						name: 'value',
						displayName: 'Value',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								default: 'string',
								options: [
									{
										name: 'String',
										value: 'string',
									},
									{
										name: 'Number',
										value: 'number',
									},
									{
										name: 'Boolean',
										value: 'boolean',
									},
								],
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The Any value to write in the property',
							},
						],
					},
				],
			},
		]
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];

		const mysql = require('mysql');

		const items = this.getInputData();
		for (let i = 0; i < items.length; i++) {
			const inputValues = this.getNodeParameter('values.value', i) as INodeParameters[]

			const values: (string | number | boolean)[] = []
			for (const value of inputValues) {
				switch (value.type) {
					case 'string':
						values.push(value.value as string)
						break
					case 'number':
						values.push(Number(value.value))
						break
					case 'boolean':
						values.push(value.value === 'true')
						break
				}
			}

			const sql = this.getNodeParameter('sql', i) as string;
			const query = mysql.format(sql, values);

			returnData.push({
				json: {
					sql: query,
					values: values,
				}
			});
		}

		return [returnData];
	}
}
