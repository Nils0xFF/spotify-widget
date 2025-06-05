'use server';

import { auth } from '@/auth';
import { createWidget, getWidgets } from '@/lib/db';

async function createWidgetAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');
  await createWidget('Test', session.user.id);
}

export default async function Dashboard() {
  const session = await auth();
  const widgets = await getWidgets(session?.user?.id || '');

  return (
    <div className="container text-center mx-auto">
      <h1>Dashboard</h1>
      <form action={createWidgetAction}>
        <button type="submit">Create Widget</button>
      </form>
      {widgets.map((widget) => (
        <div key={widget.id}>
          {widget.name}({widget.id})
        </div>
      ))}
    </div>
  );
}
