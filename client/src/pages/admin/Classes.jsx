import { useFetch } from '../../hooks/useFetch';
import EntityPage from '../../components/EntityPage';
import { Badge, NameCell } from '../../components/ui';

const initialForm = { name: '', section: '', academicYear: '', classTeacherId: '' };

export default function Classes() {
  const { data: teachers } = useFetch('/api/teachers');

  const teacherOptions = (teachers?.teachers || []).map((t) => ({
    value: t.userId?._id || t.userId,
    label: `${t.userId?.name || t.employeeId} (${t.employeeId})`,
  }));

  return (
    <EntityPage
      title="Classes"
      actionLabel="+ Add Class"
      fetchPath="/api/classes"
      dataKey="classes"
      subtitle={(rows) => `${rows.length} classes`}
      emptyIcon="🏛️"
      emptyTitle="No classes yet"
      emptyMessage="Create classes so you can assign students and subjects."
      initialForm={initialForm}
      editable
      deletable={false}
      createMessage={(f) => `Class ${f.name}${f.section ? '-' + f.section : ''} created`}
      editMessage="Class updated successfully"
      formFields={[
        { name: 'name', label: 'Class Name', required: true, placeholder: 'e.g. Class 10' },
        { name: 'section', label: 'Section', placeholder: 'e.g. A' },
        { name: 'academicYear', label: 'Academic Year', required: true, placeholder: 'e.g. 2025-26' },
        {
          name: 'classTeacherId',
          label: 'Class Teacher',
          type: 'select',
          options: teacherOptions,
          placeholder: '— Assign teacher —',
        },
      ]}
      columns={[
        {
          key: 'name',
          label: 'Class',
          render: (c) => (
            <div style={{ fontWeight: 600 }}>
              {c.name}
              {c.section ? ` - ${c.section}` : ''}
            </div>
          ),
        },
        { key: 'academicYear', label: 'Academic Year' },
        {
          key: 'classTeacherId',
          label: 'Class Teacher',
          render: (c) =>
            c.classTeacherId ? <NameCell name={c.classTeacherId.name} sub={c.classTeacherId.email} /> : '—',
        },
        {
          key: 'isActive',
          label: 'Status',
          render: (c) =>
            c.isActive ? <Badge color="green">Active</Badge> : <Badge color="gray">Inactive</Badge>,
        },
      ]}
    />
  );
}