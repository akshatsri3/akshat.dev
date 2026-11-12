# Required npm packages for Journal Maps

Run in project root:

```
npm install leaflet react-leaflet @types/leaflet
```

> **Note:** Both `JournalWorldMap` and `TripDetailMap` must be dynamically imported
> with `ssr: false` in the consuming pages/components.
>
> Example:
> ```tsx
> const JournalWorldMap = dynamic(() => import('@/components/journal/JournalWorldMap'), { ssr: false });
> const TripDetailMap   = dynamic(() => import('@/components/journal/TripDetailMap'),   { ssr: false });
> ```
