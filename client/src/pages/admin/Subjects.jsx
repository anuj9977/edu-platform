import EntityPage from '../../components/EntityPage';
import { Badge } from '../../components/ui';

const initialForm = { name: '', code: '', description: '' };

export default function Subjects() {
  return (
    <EntityPage
      title="Subjects"
      actionLabel="+ Add Subject"
      fetchPath="/api/subjects"
      dataKey="subjects"
      subtitle={(rows) => `${rows.length} subjects`}
      emptyIcon="📚"
      emptyTitle="No subjects yet"
      emptyMessage="Add subjects like Mathematics, Science, English…"
      initialForm={initialForm}
      editable={false}
      deletable={false}
      createMessage={(f) => `Subject “${f.name}” created`}
      formFields={[
        { name: 'name', label: 'Subject Name', required: true },
        { name: 'code', label: 'Code', placeholder: 'e.g. MATH' },
        { name: 'description', label: 'Description', type: 'textarea', span2: true },
      ]}
      columns={[
        { key: 'name', label: 'Name', render: (s) => <span style={{ fontWeight: 600 }}>{s.name}</span> },
        { key: 'code', label: 'Code', render: (s) => s.code || '—' },
        { key: 'description', label: 'Description', render: (s) => s.description || '—' },
        {
          key: 'isActive',
          label: 'Status',
          render: (s) =>
            s.isActive ? <Badge color="green">Active</Badge> : <Badge color="gray">Inactive</Badge>,
        },
      ]}
    />
  );
}