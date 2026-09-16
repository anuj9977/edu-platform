import AnnouncementsReader from '../../components/AnnouncementsReader';

export default function ParentAnnouncements() {
  return <AnnouncementsReader fetchPath="/api/announcements/parent" title="Announcements" />;
}