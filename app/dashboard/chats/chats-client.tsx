"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ChevronRight, Clock, User, Bot, Monitor, Globe } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  isFromVisitor: boolean;
  createdAt: Date;
}

interface ChatLead {
  id: string;
  name: string | null;
  email: string | null;
  status: string;
  confidence: number;
}

interface ChatSession {
  id: string;
  sessionId: string;
  visitorId: string | null;
  country: string | null;
  deviceInfo: string | null;
  startedAt: Date;
  lastMessageAt: Date;
  messages: ChatMessage[];
  lead: ChatLead | null;
}

interface ChatsData {
  sessions: ChatSession[];
  total: number;
  limit: number;
  offset: number;
}

function fetchChats(limit: number, offset: number): Promise<ChatsData> {
  return fetch(`/api/chat-sessions?limit=${limit}&offset=${offset}`).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });
}

function ChatSessionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}

function ChatMessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.isFromVisitor;
  
  return (
    <div className={`flex gap-3 ${isUser ? "" : "flex-row-reverse"}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`flex max-w-[80%] flex-col gap-1 ${isUser ? "" : "items-end"}`}>
        <div className={`rounded-lg px-3 py-2 ${isUser ? "bg-muted" : "bg-primary text-primary-foreground"}`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(message.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function ChatSessionCard({ session, onClick }: { session: ChatSession; onClick: () => void }) {
  const preview = session.messages[session.messages.length - 1]?.content.slice(0, 100) || "No messages";
  
  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onClick}>
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Chat Session</CardTitle>
            {session.lead ? (
              <Badge className="bg-green-500 hover:bg-green-600">Lead</Badge>
            ) : (
              <Badge variant="outline">{session.messages.length} messages</Badge>
            )}
          </div>
          <CardDescription className="flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3" />
            {new Date(session.startedAt).toLocaleString()}
          </CardDescription>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {session.lead ? (
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {session.lead.name || session.lead.email || "Unknown"}
            </span>
            {session.lead.email && (
              <span className="text-xs text-muted-foreground">({session.lead.email})</span>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-2">{preview}...</p>
        )}
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          {session.country && (
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {session.country}
            </span>
          )}
          {session.deviceInfo && (
            <span className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              {session.deviceInfo.slice(0, 30)}...
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ChatDetailView({ session, onBack }: { session: ChatSession; onBack: () => void }) {
  return (
    <Card className="h-[calc(100vh-200px)]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat Session
              {session.lead && (
                <Badge className="bg-green-500 hover:bg-green-600 ml-2">Lead Captured</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Started: {new Date(session.startedAt).toLocaleString()}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onBack}>
            Back to list
          </Button>
        </div>
        {session.lead && (
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Lead Information</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              {session.lead.name && (
                <div>
                  <span className="text-muted-foreground">Name:</span> {session.lead.name}
                </div>
              )}
              {session.lead.email && (
                <div>
                  <span className="text-muted-foreground">Email:</span> {session.lead.email}
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Status:</span> {session.lead.status}
              </div>
              <div>
                <span className="text-muted-foreground">Confidence:</span> {Math.round(session.lead.confidence * 100)}%
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <ScrollArea className="h-[calc(100%-130px)] p-4">
        <div className="space-y-4">
          {session.messages.map((message) => (
            <ChatMessageItem key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

export function ChatsClient() {
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["chats", limit, offset],
    queryFn: () => fetchChats(limit, offset),
  });

  useEffect(() => {
    if (sessionIdParam && data?.sessions) {
      const session = data.sessions.find(s => s.sessionId === sessionIdParam);
      if (session) {
        setSelectedSession(session);
      }
    }
  }, [sessionIdParam, data]);

  const handlePrevious = () => {
    setSelectedSession(null);
    setOffset(Math.max(0, offset - limit));
  };

  const handleNext = () => {
    setSelectedSession(null);
    if (data && offset + limit < data.total) {
      setOffset(offset + limit);
    }
  };

  if (selectedSession) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat History</h1>
          <p className="text-muted-foreground">
            View conversations between visitors and your AI agent.
          </p>
        </div>
        <ChatDetailView session={selectedSession} onBack={() => setSelectedSession(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chat History</h1>
        <p className="text-muted-foreground">
          View conversations between visitors and your AI agent.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ChatSessionSkeleton key={i} />
          ))}
        </div>
      ) : data ? (
        <>
          {data.sessions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No chat sessions yet</p>
                <p className="text-sm text-muted-foreground">
                  When visitors chat with your AI agent, their conversations will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.sessions.map((session) => (
                <ChatSessionCard
                  key={session.id}
                  session={session}
                  onClick={() => setSelectedSession(session)}
                />
              ))}
            </div>
          )}

          {data.total > limit && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={offset === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Showing {offset + 1} - {Math.min(offset + limit, data.total)} of {data.total}
              </span>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={offset + limit >= data.total}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
