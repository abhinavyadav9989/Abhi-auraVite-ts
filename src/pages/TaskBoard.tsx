import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { User } from '@/api/entities';
import { Dealer } from '@/api/entities';
import { Vehicle } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Car,
  Shield,
  Plus
} from 'lucide-react';

const TASK_COLUMNS = {
  todo: { title: 'To Do', color: 'bg-slate-100', icon: Clock },
  in_progress: { title: 'In Progress', color: 'bg-blue-100', icon: AlertTriangle },
  completed: { title: 'Completed', color: 'bg-green-100', icon: CheckSquare }
};

const TaskCard = ({ task, index }) => (
  <Draggable draggableId={task.id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`p-3 mb-3 bg-white rounded-lg border shadow-sm transition-all ${
          snapshot.isDragging ? 'shadow-lg rotate-1' : 'hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-sm">{task.title}</span>
          </div>
          <Badge 
            variant="secondary" 
            className={
              task.priority === 'high' ? 'bg-red-100 text-red-700' :
              task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
            }
          >
            {task.priority}
          </Badge>
        </div>
        <p className="text-xs text-slate-600 mb-2">{task.description}</p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{task.category}</span>
          <span>Due: {task.due_date}</span>
        </div>
      </div>
    )}
  </Draggable>
);

export default function TaskBoard() {
  const [tasks, setTasks] = useState({
    todo: [],
    in_progress: [],
    completed: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      // Mock tasks for demo - in real app these would come from a Tasks entity
      const mockTasks = {
        todo: [
          {
            id: 'task-1',
            title: 'Upload GST Certificate',
            description: 'KYB verification requires updated GST certificate',
            category: 'KYB',
            priority: 'high',
            due_date: 'Today'
          },
          {
            id: 'task-2', 
            title: 'Update Vehicle Photos',
            description: '5 vehicles need better quality images',
            category: 'Inventory',
            priority: 'medium',
            due_date: 'Tomorrow'
          }
        ],
        in_progress: [
          {
            id: 'task-3',
            title: 'RTO Transfer Documentation',
            description: 'Preparing documents for 3 pending transfers',
            category: 'RTO',
            priority: 'high',
            due_date: '2 days'
          }
        ],
        completed: [
          {
            id: 'task-4',
            title: 'Bank Account Verification',
            description: 'Successfully verified account details',
            category: 'Banking',
            priority: 'medium',
            due_date: 'Completed'
          }
        ]
      };
      
      setTasks(mockTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
    setIsLoading(false);
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColumn = tasks[source.droppableId];
    const destColumn = tasks[destination.droppableId];
    const draggedTask = sourceColumn[source.index];

    const newSourceColumn = [...sourceColumn];
    newSourceColumn.splice(source.index, 1);

    const newDestColumn = source.droppableId === destination.droppableId ? newSourceColumn : [...destColumn];
    newDestColumn.splice(destination.index, 0, draggedTask);

    setTasks(prev => ({
      ...prev,
      [source.droppableId]: newSourceColumn,
      [destination.droppableId]: newDestColumn
    }));

    toast({
      title: "Task Updated",
      description: `Moved "${draggedTask.title}" to ${TASK_COLUMNS[destination.droppableId].title}`,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Task Board</h1>
            <p className="text-slate-600">Manage your pending tasks and workflows</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(TASK_COLUMNS).map(([columnId, column]) => {
              const Icon = column.icon;
              return (
                <div key={columnId} className="flex flex-col">
                  <div className={`p-4 rounded-t-lg ${column.color}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <h3 className="font-semibold">{column.title}</h3>
                      </div>
                      <Badge variant="secondary">
                        {tasks[columnId].length}
                      </Badge>
                    </div>
                  </div>
                  
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-4 bg-slate-100/50 rounded-b-lg min-h-[400px] transition-colors ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {tasks[columnId].map((task, index) => (
                          <TaskCard key={task.id} task={task} index={index} />
                        ))}
                        {provided.placeholder}
                        
                        {tasks[columnId].length === 0 && (
                          <div className="text-center py-8 text-slate-400">
                            <CheckSquare className="w-8 h-8 mx-auto mb-2" />
                            <p>No tasks</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}