export interface ListHeader {
  name: string;
  createdAt: string;
  lastModified: string;
}

export interface ListBody {
  items: string[];
  status: boolean[];
}

export interface List {
  header: ListHeader;
  body: ListBody;
} 