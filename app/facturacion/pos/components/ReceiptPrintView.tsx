'use client';

import type { TransactionDetail } from '@/lib/api/types';

function deepFindString(obj: any, maxDepth = 4): string | undefined {
  const seen = new Set<any>();

  function walk(v: any, depth: number): string | undefined {
    if (depth > maxDepth) return undefined;
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'string') {
      const s = v.trim();
      // ignora strings tipo GUID o vacíos
      if (!s) return undefined;
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return undefined;
      return s;
    }
    if (typeof v !== 'object') return undefined;
    if (seen.has(v)) return undefined;
    seen.add(v);

    if (Array.isArray(v)) {
      for (const x of v) {
        const r = walk(x, depth + 1);
        if (r) return r;
      }
      return undefined;
    }

    // prioriza keys que suelen ser nombres
    const preferredKeys = ['name', 'nombre', 'description', 'descripcion', 'label', 'title', 'concept'];
    for (const k of preferredKeys) {
      if (k in v) {
        const r = walk(v[k], depth + 1);
        if (r) return r;
      }
    }

    for (const k of Object.keys(v)) {
      const r = walk(v[k], depth + 1);
      if (r) return r;
    }
    return undefined;
  }

  return walk(obj, 0);
}

function guessLabelWithContext(sectionTitle: string, item: any, idx: number): string {
  // 1) intenta tu lógica actual
  const base = guessLabel(item);
  if (base && base !== 'Item') return base;

  // 2) si hay IDs típicos, muéstralos
  const idHint =
    pickFirst(item, [
      'entranceTypeId',
      'entranceId',
      'barProductId',
      'productId',
      'keyId',
      'lockerKeyId',
      'accessCardTypeId',
      'accessCardId',
      'id',
    ]) ?? '';

  const idText = safeStr(idHint);
  if (idText) return `${sectionTitle} (${idText.slice(0, 8)})`;

  // 3) best-effort: busca cualquier string dentro del objeto
  const deep = deepFindString(item);
  if (deep) return deep;

  // 4) fallback decente
  return `${sectionTitle} #${idx + 1}`;
}


function money(n: unknown) {
  const v = typeof n === 'number' ? n : Number(n ?? 0);
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(
    Number.isFinite(v) ? v : 0
  );
}

function dt(dateString?: string | null) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleString('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function safeStr(v: unknown) {
  return String(v ?? '').trim();
}

function toNum(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (v === null || v === undefined) return 0;

  let s = String(v).trim();
  if (!s) return 0;

  s = s.replace(/[^\d,.-]/g, '');

  if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.');

  if (s.includes(',') && s.includes('.')) {
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.'); // 1.234,56 -> 1234.56
    } else {
      s = s.replace(/,/g, ''); // 1,234.56 -> 1234.56
    }
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function getPath(obj: any, path: string) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function pickFirst<T = any>(obj: any, keys: string[]): T | undefined {
  for (const k of keys) {
    const val = k.includes('.') ? getPath(obj, k) : obj?.[k];
    if (val !== undefined && val !== null && String(val).trim() !== '') return val;
  }
  return undefined;
}

function guessLabel(item: any): string {
  const label = pickFirst(item, [
    // directos
    'name',
    'productName',
    'description',
    'detail',
    'notes',
    'type',
    'zone',
    'plate',
    'keyCode',

    // anidados típicos
    'entranceType.name',
    'entranceType.description',
    'entrance.name',
    'ticketType.name',

    'barProduct.name',
    'barProduct.productName',
    'product.name',
    'product.description',
    'item.name',
    'item.productName',

    'accessCardType.name',
    'accessCardType.description',
    'accessCard.name',

    'key.code',
    'lockerKey.code',
  ]);

  return safeStr(label) || 'Item';
}

function guessQty(item: any): number {
  const qty = pickFirst(item, [
    'quantity',
    'qty',
    'count',
    'uses',
    'hours',
    'minutes',

    // anidados
    'item.quantity',
    'detail.quantity',
    'line.quantity',
  ]);
  const n = toNum(qty);
  return n > 0 ? n : 1;
}

function guessUnit(item: any): number | null {
  const unit = pickFirst(item, [
    'unitPrice',
    'price',
    'rate',
    'value',
    'unit',
    'unit_amount',

    // anidados
    'entranceType.price',
    'barProduct.unitPrice',
    'product.unitPrice',
    'accessCardType.price',
    'item.unitPrice',
    'detail.unitPrice',
  ]);
  const n = toNum(unit);
  return n > 0 ? n : null;
}

function guessTotal(item: any): number {
  const total = pickFirst(item, [
    'total',
    'amount',
    'lineTotal',
    'subtotal',
    'totalPrice',
    'total_amount',

    // anidados
    'item.total',
    'detail.total',
    'line.total',
  ]);

  const n = toNum(total);
  if (n !== 0) return n;

  const q = guessQty(item);
  const u = guessUnit(item);
  if (u !== null) return q * u;

  return 0;
}

function sumSection(list: any[]): number {
  if (!Array.isArray(list) || list.length === 0) return 0;
  return list.reduce((acc, it) => acc + guessTotal(it), 0);
}

function SectionTable({ rows, sectionTitle }: { rows: any[]; sectionTitle: string }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return <div style={{ fontSize: 11, color: '#6b7280', padding: '10px 12px' }}>Sin registros</div>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 11 }}>
      <thead>
        <tr>
          <th style={thLeft}>Concepto</th>
          <th style={thRight}>Cant.</th>
          <th style={thRight}>Unit.</th>
          <th style={thRight}>Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((it, idx) => {
          const qty = guessQty(it);
          const unit = guessUnit(it);
          const total = guessTotal(it);

          return (
            <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
              <td style={tdLeft}>{guessLabelWithContext(sectionTitle, it, idx)}</td>
              <td style={tdRight}>{qty}</td>
              <td style={tdRight}>{unit === null ? '—' : money(unit)}</td>
              <td style={tdRightStrong}>{money(total)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const thLeft: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  background: '#f3f4f6',
  color: '#111827',
  fontWeight: 700,
  borderTopLeftRadius: 10,
  borderBottom: '1px solid #e5e7eb',
};

const thRight: React.CSSProperties = {
  textAlign: 'right',
  padding: '10px 12px',
  background: '#f3f4f6',
  color: '#111827',
  fontWeight: 700,
  borderBottom: '1px solid #e5e7eb',
};

const tdLeft: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '1px solid #f3f4f6',
  color: '#111827',
};

const tdRight: React.CSSProperties = {
  textAlign: 'right',
  padding: '10px 12px',
  borderBottom: '1px solid #f3f4f6',
  color: '#111827',
  whiteSpace: 'nowrap',
};

const tdRightStrong: React.CSSProperties = {
  ...tdRight,
  fontWeight: 700,
};

function Card({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      <div
        style={{
          padding: '10px 12px',
          background: '#111827',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.2 }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>{subtitle}</div> : null}
        </div>
        {right}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0' }}>
      <span style={{ color: '#374151', fontWeight: 700 }}>{label}</span>
      <span style={{ fontWeight: strong ? 900 : 700, color: accent ? '#b91c1c' : '#111827', whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </div>
  );
}

export function ReceiptPrintView({
  detail,
  logoSrc = '/brand/logo.png',
}: {
  detail: TransactionDetail;
  logoSrc?: string;
}) {
  const {
    transaction,
    entrances,
    keys,
    parkings,
    barOrders,
    accessCards,
    totalCharges,
    totalPayments,
    pendingBalance,
  } = detail;

  const client = (transaction as any)?.client;
  const openedAt = (transaction as any)?.openedAt;
  const closedAt = (transaction as any)?.closedAt;
  const status = safeStr((transaction as any)?.status) || '—';
  const receiptNo = safeStr((transaction as any)?.id);

  // Aplana Bar si viene con items/details/lines
  const barRows =
    (barOrders as any[] | undefined)?.flatMap((o) => o?.items ?? o?.details ?? o?.lines ?? [o]) ?? [];

  const rawSections = [
    { title: 'Entradas', rows: (entrances as any[]) ?? [] },
    { title: 'Llaves', rows: (keys as any[]) ?? [] },
    { title: 'Parqueo', rows: (parkings as any[]) ?? [] },
    { title: 'Bar', rows: barRows },
    { title: 'Tarjetas de pases', rows: (accessCards as any[]) ?? [] },
    { title: 'Pagos', rows: (((transaction as any)?.payments ?? []) as any[]) ?? [] },
  ];

  const sections = rawSections
    .map((s) => {
      const rows = Array.isArray(s.rows) ? s.rows : [];
      const subtotal = sumSection(rows);
      return { ...s, rows, subtotal };
    })
    .filter((s) => s.rows.length > 0);

  return (
    <div
      style={{
        width: 760,
        padding: 22,
        background: '#ffffff',
        color: '#111827',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div style={{ width: 150, height: 60, display: 'flex', alignItems: 'center' }}>
          <img src={logoSrc} alt="Logo" style={{ maxWidth: '150px', maxHeight: '60px', objectFit: 'contain' }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 0.2 }}>Piscina Zero Stress</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Comprobante de cuenta</div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 220 }}>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Fecha</div>
          <div style={{ fontSize: 12, fontWeight: 800 }}>{dt(closedAt ?? openedAt)}</div>
          <div style={{ fontSize: 10, color: '#6b7280', marginTop: 6 }}>Estado</div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 2,
              fontSize: 10,
              fontWeight: 900,
              padding: '4px 8px',
              borderRadius: 999,
              background: status === 'Open' ? '#fff7ed' : '#ecfeff',
              color: status === 'Open' ? '#9a3412' : '#155e75',
              border: '1px solid #e5e7eb',
            }}
          >
            {status}
          </div>
        </div>
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          padding: 12,
          background: '#f9fafb',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 260 }}>
            <div style={{ fontSize: 10, color: '#6b7280' }}>N° Comprobante</div>
            <div style={{ fontSize: 12, fontWeight: 900 }}>{receiptNo}</div>
          </div>

          <div style={{ minWidth: 230 }}>
            <div style={{ fontSize: 10, color: '#6b7280' }}>Cliente</div>
            <div style={{ fontSize: 12, fontWeight: 900 }}>{safeStr(client?.name) || 'Sin cliente'}</div>
            {safeStr(client?.documentNumber) ? (
              <div style={{ fontSize: 10, color: '#6b7280' }}>CI: {safeStr(client?.documentNumber)}</div>
            ) : null}
          </div>

          <div style={{ minWidth: 200 }}>
            <div style={{ fontSize: 10, color: '#6b7280' }}>Apertura</div>
            <div style={{ fontSize: 11, fontWeight: 800 }}>{dt(openedAt)}</div>
            {closedAt ? (
              <>
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 6 }}>Cierre</div>
                <div style={{ fontSize: 11, fontWeight: 800 }}>{dt(closedAt)}</div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {sections.map((s) => (
          <Card
            key={s.title}
            title={s.title}
            right={<div style={{ fontSize: 11, fontWeight: 900 }}>Subtotal: {money(s.subtotal)}</div>}
          >
            <SectionTable rows={s.rows} sectionTitle={s.title} />
          </Card>
        ))}

      </div>

      <div style={{ marginTop: 14, border: '1px solid #111827', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ background: '#111827', color: '#fff', padding: '10px 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 900 }}>Totales</div>
        </div>

        <div style={{ padding: 12, background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 320 }}>
              <Row label="Total" value={money(totalCharges)} strong />
              <Row label="Pagado" value={money(totalPayments)} strong />
              <Row
                label="Pendiente"
                value={money(pendingBalance)}
                strong
                accent={toNum(pendingBalance) > 0}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 10,
              color: '#6b7280',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px dashed #e5e7eb',
              paddingTop: 10,
            }}
          >
            <span>Gracias por su visita.</span>
            <span>Generado por Zero Stress POS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
