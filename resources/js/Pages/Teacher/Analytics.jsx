import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';

export default function TeacherAnalytics() {
    return (
        <AppLayout>
            <TeacherHeader teacherName="Mr. Davis" teacherRole="Guru Perpajakan" initials="D" isOnline />

            <TeacherBottomNav active="analytics" />
        </AppLayout>
    );
}
