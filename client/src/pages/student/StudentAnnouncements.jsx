import AnnouncementsReader from '../../components/AnnouncementsReader';

export default function StudentAnnouncements() {
  return <AnnouncementsReader fetchPath="/api/announcements/student" title="Announcements" />;
}