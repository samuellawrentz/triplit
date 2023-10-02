import { DataType } from './base';
import { RecordAttributeDefinition } from './serialization';
import {
  ExtractDeserializedType,
  ExtractSerializedType,
  ExtractTimestampedType,
  TypeInterface,
} from './type';

export type RecordType<Properties extends { [k: string]: DataType }> =
  TypeInterface<
    'record',
    { [k in keyof Properties]: ExtractDeserializedType<Properties[k]> },
    { [k in keyof Properties]: ExtractSerializedType<Properties[k]> },
    { [k in keyof Properties]: ExtractTimestampedType<Properties[k]> },
    readonly []
  > & {
    properties: Properties;
  };

export function RecordType<Properties extends { [k: string]: DataType }>(
  properties: Properties
): RecordType<Properties> {
  return {
    type: 'record' as const,
    supportedOperations: [] as const, // 'hasKey', etc
    properties,
    toJSON(): RecordAttributeDefinition {
      const serializedProps = Object.fromEntries(
        Object.entries(properties).map(([key, val]) => [key, val.toJSON()])
      );
      return { type: this.type, properties: serializedProps };
    },
    serialize(val: any) {
      return val;
    },
    deserialize(val: any) {
      return val;
    },
    // TODO: determine proper value and type here
    // Type should go extract the deserialized type of each of its keys
    default() {
      return Object.fromEntries(
        Object.entries(properties).map(([key, val]) => [key, val.default()])
      );
    },
    validate(_val: any) {
      return true; // TODO
    },
    deserializeCRDT(val) {
      return Object.fromEntries(
        Object.entries(val).map(([k, v]) => [
          k,
          properties[k].deserializeCRDT(v),
        ])
      );
    },
  };
}
