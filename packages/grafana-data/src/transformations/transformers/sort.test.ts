import {
  ArrayVector,
  DataTransformerConfig,
  DataTransformerID,
  FieldType,
  toDataFrame,
  transformDataFrame,
} from '@grafana/data';
import { SortFieldsTransformerOptions } from './sort';

describe('Sort Transformer', () => {
  const allInConfig = toDataFrame({
    name: 'A',
    fields: [
      { name: 'time', type: FieldType.time, values: [3000, 4000, 5000, 6000] },
      { name: 'temperature', type: FieldType.number, values: [10.3, 10.4, 10.5, 10.6] },
      { name: 'humidity', type: FieldType.number, values: [10000.3, 10000.4, 10000.5, 10000.6] },
    ],
  });

  const missingInConfig = toDataFrame({
    name: 'A',
    fields: [
      { name: 'time', type: FieldType.time, values: [3000, 4000, 5000, 6000] },
      { name: 'pressure', type: FieldType.number, values: [10.3, 10.4, 10.5, 10.6] },
      { name: 'humidity', type: FieldType.number, values: [10000.3, 10000.4, 10000.5, 10000.6] },
    ],
  });

  it('should sort according to config', () => {
    const cfg: DataTransformerConfig<SortFieldsTransformerOptions> = {
      id: DataTransformerID.sort,
      options: {
        indexByName: {
          time: 2,
          temperature: 0,
          humidity: 1,
        },
      },
    };

    const sorted = transformDataFrame([cfg], [allInConfig])[0];

    expect(sorted.fields).toEqual([
      {
        config: {},
        name: 'temperature',
        type: FieldType.number,
        values: new ArrayVector([10.3, 10.4, 10.5, 10.6]),
      },
      {
        config: {},
        name: 'humidity',
        type: FieldType.number,
        values: new ArrayVector([10000.3, 10000.4, 10000.5, 10000.6]),
      },
      {
        config: {},
        name: 'time',
        type: FieldType.time,
        values: new ArrayVector([3000, 4000, 5000, 6000]),
      },
    ]);
  });

  it('should append fields missing in config at the end', () => {
    const cfg: DataTransformerConfig<SortFieldsTransformerOptions> = {
      id: DataTransformerID.sort,
      options: {
        indexByName: {
          time: 2,
          temperature: 0,
          humidity: 1,
        },
      },
    };

    const sorted = transformDataFrame([cfg], [missingInConfig])[0];

    expect(sorted.fields).toEqual([
      {
        config: {},
        name: 'humidity',
        type: FieldType.number,
        values: new ArrayVector([10000.3, 10000.4, 10000.5, 10000.6]),
      },
      {
        config: {},
        name: 'time',
        type: FieldType.time,
        values: new ArrayVector([3000, 4000, 5000, 6000]),
      },
      {
        config: {},
        name: 'pressure',
        type: FieldType.number,
        values: new ArrayVector([10.3, 10.4, 10.5, 10.6]),
      },
    ]);
  });
});
