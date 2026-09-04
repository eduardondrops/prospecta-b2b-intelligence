export type Company = {
  id: string;
  name: string;
  segment: "Logistics" | "Healthcare" | "Retail" | "Technology" | "Construction";
  city: string;
  state: "CE" | "PE" | "BA" | "SP" | "MG";
  score: number;
  signal: "High" | "Medium" | "Low";
  website: boolean;
  contact: "Verified" | "Partial";
};

export const companies: Company[] = [
  { id: "p-101", name: "Atlas Norte Logística", segment: "Logistics", city: "Fortaleza", state: "CE", score: 92, signal: "High", website: true, contact: "Verified" },
  { id: "p-102", name: "Clínica Horizonte", segment: "Healthcare", city: "Recife", state: "PE", score: 86, signal: "High", website: true, contact: "Verified" },
  { id: "p-103", name: "Vértice Construções", segment: "Construction", city: "Belo Horizonte", state: "MG", score: 81, signal: "High", website: true, contact: "Partial" },
  { id: "p-104", name: "Mercato Regional", segment: "Retail", city: "Salvador", state: "BA", score: 76, signal: "Medium", website: false, contact: "Verified" },
  { id: "p-105", name: "Nexo Sistemas", segment: "Technology", city: "São Paulo", state: "SP", score: 73, signal: "Medium", website: true, contact: "Partial" },
  { id: "p-106", name: "Rota Clara Transportes", segment: "Logistics", city: "Juazeiro do Norte", state: "CE", score: 68, signal: "Medium", website: false, contact: "Verified" },
  { id: "p-107", name: "Saúde Plena Centro", segment: "Healthcare", city: "Campinas", state: "SP", score: 61, signal: "Medium", website: true, contact: "Partial" },
  { id: "p-108", name: "Ponto Urbano Obras", segment: "Construction", city: "Caruaru", state: "PE", score: 54, signal: "Low", website: false, contact: "Partial" },
];
