import AnnouncementsReader from '../../components/AnnouncementsReader';

export default function TeacherAnnouncements() {
  return <AnnouncementsReader fetchPath="/api/announcements/teacher" title="Announcements" />;
}