export type FeatureCollection = {
  type: "FeatureCollection";
  version: string;
  features: Feature[];
  attribution: string;
  licence: string;
  query: string;
  limit: number;
};

export type Feature = {
  type: "Feature";
  geometry: Geometry;
  properties: Properties;
};

type Geometry = {
  type: "Point";
  coordinates: [number, number];
};

type Properties = {
  label: string;
  score: number;
  housenumber?: string;
  id: string;
  name: string;
  postcode: string;
  citycode: string;
  x: number;
  y: number;
  city: string;
  district?: string;
  context: string;
  type: string;
  importance: number;
  street?: string;
  banId?: string;
  oldcitycode?: string;
  oldcity?: string;
  municipality?: string;
  population?: number;
};
