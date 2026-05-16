import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { mockPlates as initialPlates } from '@/data/mockPlates'
import { LevelBadge } from '@/components/LevelBadge'
import { Modal } from '@/components/Modal'

const emptyForm = {
  plate: '',
  reason: 'Volée',
  riskLevel: 'orange',
  note: '',
}

export function PlatesPage() {
  const [plates, setPlates] = useState(initialPlates)
  const [filter, setFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = useMemo(() => {
    const q = filter.toLowerCase()
    return plates.filter(
      (p) =>
        p.plate.toLowerCase().includes(q) ||
        p.reason.toLowerCase().includes(q) ||
        p.addedBy.toLowerCase().includes(q),
    )
  }, [plates, filter])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (plate) => {
    setEditing(plate)
    setForm({
      plate: plate.plate,
      reason: plate.reason,
      riskLevel: plate.riskLevel,
      note: plate.note,
    })
    setModalOpen(true)
  }

  const save = () => {
    if (editing) {
      setPlates((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? { ...p, ...form, riskLevel: form.riskLevel }
            : p,
        ),
      )
    } else {
      setPlates((prev) => [
        {
          id: `p-${Date.now()}`,
          ...form,
          addedDate: new Date().toISOString().slice(0, 10),
          addedBy: 'Agent Dubois',
        },
        ...prev,
      ])
    }
    setModalOpen(false)
  }

  const remove = (id) => {
    setPlates((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrer les plaques…"
          className="max-w-sm flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-white focus:outline-none"
        />
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          Ajouter une plaque
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs uppercase text-[var(--color-muted)]">
              <th className="px-4 py-3">Plaque</th>
              <th className="px-4 py-3">Motif</th>
              <th className="px-4 py-3">Risque</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Ajouté par</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-[var(--color-border)]">
                <td className="px-4 py-3 font-mono font-semibold">{p.plate}</td>
                <td className="px-4 py-3 text-sm">{p.reason}</td>
                <td className="px-4 py-3">
                  <LevelBadge level={p.riskLevel === 'red' ? 'red' : 'orange'} />
                </td>
                <td className="px-4 py-3 text-sm text-[var(--color-muted)]">{p.addedDate}</td>
                <td className="px-4 py-3 text-sm">{p.addedBy}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="rounded p-1.5 text-[var(--color-muted)] hover:bg-white/5 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="rounded p-1.5 text-[var(--color-muted)] hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier la plaque' : 'Ajouter une plaque'}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[var(--color-muted)]">Plaque</label>
            <input
              value={form.plate}
              onChange={(e) => setForm({ ...form, plate: e.target.value })}
              placeholder="HT-XXXX-XX"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 font-mono text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--color-muted)]">Motif</label>
            <select
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-white"
            >
              <option>Volée</option>
              <option>Frauduleuse</option>
              <option>Suspecte</option>
              <option>Autre</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--color-muted)]">Niveau de risque</label>
            <select
              value={form.riskLevel}
              onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-white"
            >
              <option value="orange">Orange</option>
              <option value="red">Rouge</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--color-muted)]">Note</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-white focus:outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)]"
            >
              Annuler
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
