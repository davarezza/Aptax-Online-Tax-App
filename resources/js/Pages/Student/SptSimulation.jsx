import AppLayout from '@/Components/AppLayout';
import StudentHeader from '@/Components/Student/Header';
import StudentBottomNav from '@/Components/Student/BottomNav';

export default function StudentLeaderboard() {
    return (
        <AppLayout>
            <StudentHeader />
            <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto pb-24">

            </div>

            <StudentBottomNav active="spt-simulation" />
        </AppLayout>
    );
}
