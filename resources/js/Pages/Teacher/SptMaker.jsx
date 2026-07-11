import AppLayout from '@/Components/AppLayout';
import TeacherHeader from '@/Components/Teacher/Header';
import TeacherBottomNav from '@/Components/Teacher/BottomNav';

export default function TeacherDashboard() {
    return (
        <AppLayout>
            <div className="flex-1 overflow-y-auto bg-[#F4F6F9] pb-24">
                <TeacherHeader />
            </div>

            <TeacherBottomNav active="spt-maker" />
        </AppLayout>
    );
}
