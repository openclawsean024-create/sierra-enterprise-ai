import ChatWidget from '@/components/ChatWidget';

export default function WidgetPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <ChatWidget sessionId={params.id} embedded />
    </div>
  );
}
