'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Send,
  SmilePlus,
  Paperclip,
  ArrowLeft,
  MessagesSquare,
  Check,
  CheckCheck,
  Users,
  Plus,
  Eye,
  X,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { useNavigate } from '@/context/NavigationContext';
import { timeAgo } from '../../services/connectionsService';

/* ─── Types ──────────────────────────────────────────────── */

interface Conversation {
  id: string;
  name: string;
  role: string;
  initials: string;
  gradient: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  isGroup: boolean;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  sent: boolean;
  time: string;
  read: boolean;
  dateSeparator?: string;
  senderName?: string;
}

/* ─── Constants ──────────────────────────────────────────── */

const QUICK_EMOJIS = ['👍', '❤️', '😊', '🙏', '🎉'];

const GRADIENT_PRESETS = [
  { id: 'purple', gradient: 'from-purple-500 to-violet-500' },
  { id: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'rose', gradient: 'from-rose-500 to-pink-500' },
  { id: 'amber', gradient: 'from-amber-500 to-orange-500' },
  { id: 'cyan', gradient: 'from-cyan-500 to-blue-500' },
  { id: 'fuchsia', gradient: 'from-fuchsia-500 to-rose-500' },
  { id: 'sky', gradient: 'from-sky-500 to-indigo-500' },
  { id: 'lime', gradient: 'from-lime-500 to-green-500' },
];

const CONV_STORAGE_KEY = 'fl_conversations';
const MSG_STORAGE_PREFIX = 'fl_messages_';

/* ─── localStorage helpers ───────────────────────────────── */

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONV_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(convs: Conversation[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(convs));
}

function loadMessages(conversationId: string): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MSG_STORAGE_PREFIX + conversationId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(conversationId: string, msgs: Message[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MSG_STORAGE_PREFIX + conversationId, JSON.stringify(msgs));
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/* ─── Typing Indicator ───────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Avatar Component ───────────────────────────────────── */

function Avatar({
  initials,
  gradient,
  online,
  size = 'md',
}: {
  initials: string;
  gradient: string;
  online?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xs';
}) {
  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-10 h-10 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  const dotClasses =
    size === 'xs' ? 'w-2 h-2 border' : 'w-3 h-3 border-2';

  return (
    <div className="relative shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-sm`}
      >
        {initials}
      </div>
      {online !== undefined && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${dotClasses} rounded-full ${
            online
              ? 'bg-emerald-500 border-white dark:border-gray-900'
              : 'bg-gray-400 dark:bg-gray-600 border-white dark:border-gray-900'
          }`}
        />
      )}
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────── */

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full text-center p-8"
    >
      <div className="relative w-24 h-24 mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-800"
        />
        <div className="absolute inset-3 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <MessagesSquare className="w-10 h-10 text-gray-300 dark:text-gray-600" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Select a conversation
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        Choose from your existing conversations or start a new one
      </p>
    </motion.div>
  );
}

/* ─── Message Bubble ─────────────────────────────────────── */

function MessageBubble({ message }: { message: Message }) {
  if (message.sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end mb-2"
      >
        <div className="max-w-[75%] sm:max-w-[65%]">
          {message.senderName && (
            <p className="text-[11px] text-purple-500 dark:text-purple-400 font-medium mb-1 text-right">
              {message.senderName}
            </p>
          )}
          <div className="bg-gradient-to-br from-purple-600 to-violet-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-md shadow-purple-600/15">
            <p className="text-sm leading-relaxed break-words">
              {message.content}
            </p>
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-1 px-1">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {message.time}
            </span>
            {message.read ? (
              <CheckCheck className="w-3.5 h-3.5 text-purple-500" />
            ) : (
              <Check className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start mb-2"
    >
      <div className="max-w-[75%] sm:max-w-[65%]">
        {message.senderName && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1">
            {message.senderName}
          </p>
        )}
        <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </div>
        <div className="mt-1 px-1">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {message.time}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Create Group Modal ─────────────────────────────────── */

function CreateGroupModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, gradient: string) => void;
}) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(
    GRADIENT_PRESETS[0].gradient
  );

  const handleCreate = () => {
    const trimmed = groupName.trim();
    if (!trimmed) {
      toast.error('Please enter a group name');
      return;
    }
    onCreate(trimmed, description.trim(), selectedGradient);
    onClose();
  };

  const previewInitials = getInitials(groupName.trim() || 'G');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Create New Group
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Preview Avatar */}
              <div className="flex justify-center">
                <Avatar
                  initials={previewInitials}
                  gradient={selectedGradient}
                  size="lg"
                />
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Group Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                  }}
                  placeholder="e.g. Myopia Research Team"
                  maxLength={60}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description{' '}
                  <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the group..."
                  maxLength={200}
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all resize-none"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedGradient(preset.gradient)}
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${preset.gradient} transition-all flex items-center justify-center ${
                        selectedGradient === preset.gradient
                          ? 'ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-gray-900 scale-110'
                          : 'hover:scale-105'
                      }`}
                      aria-label={preset.id}
                    >
                      {selectedGradient === preset.gradient && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!groupName.trim()}
                className={`px-5 py-2 text-sm font-medium rounded-xl transition-all ${
                  groupName.trim()
                    ? 'bg-gradient-to-br from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 shadow-md shadow-purple-600/20'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                Create Group
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Component ─────────────────────────────────────── */

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const convs = loadConversations();
    const msgsMap: Record<string, Message[]> = {};
    convs.forEach((c) => {
      msgsMap[c.id] = loadMessages(c.id);
    });
    return msgsMap;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupModalKey, setGroupModalKey] = useState(0);
  const [showNewMsgMenu, setShowNewMsgMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Close new message menu on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowNewMsgMenu(false);
      }
    };
    if (showNewMsgMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNewMsgMenu]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  /* Auto-scroll to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversationId]);

  /* Persist conversations */
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations);
    }
  }, [conversations]);

  /* Persist messages when they change */
  useEffect(() => {
    if (activeConversationId && messages[activeConversationId]) {
      saveMessages(activeConversationId, messages[activeConversationId]);
    }
  }, [messages, activeConversationId]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setMobileShowChat(true);
    setShowEmojis(false);
    setShowNewMsgMenu(false);
  }, []);

  const handleCreateGroup = useCallback(
    (name: string, description: string, gradient: string) => {
      const newConv: Conversation = {
        id: `grp_${Date.now()}`,
        name,
        role: description || '1 member',
        initials: getInitials(name),
        gradient,
        lastMessage: 'Group created',
        timestamp: timeAgo(new Date().toISOString()),
        unread: 0,
        online: false,
        isGroup: true,
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) => [newConv, ...prev]);
      setMessages((prev) => ({
        ...prev,
        [newConv.id]: [
          {
            id: `sys_${Date.now()}`,
            content: `Group "${name}" created. Start chatting!`,
            sent: true,
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            read: true,
            dateSeparator: 'Today',
          },
        ],
      }));
      setActiveConversationId(newConv.id);
      setMobileShowChat(true);
      toast.success(`Group "${name}" created`);
    },
    []
  );

  const handleNewMessage = useCallback(() => {
    setShowNewMsgMenu(false);
    toast.info('Search for members to message — coming soon!');
  }, []);

  const handleSendMessage = useCallback(() => {
    const trimmed = messageInput.trim();
    if (!trimmed || !activeConversationId) return;

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      content: trimmed,
      sent: true,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: false,
    };

    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: [
        ...(prev[activeConversationId] || []),
        newMsg,
      ],
    }));

    /* Update conversation's lastMessage and timestamp */
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastMessage: trimmed,
              timestamp: timeAgo(new Date().toISOString()),
            }
          : c
      )
    );

    setMessageInput('');
    setShowEmojis(false);
  }, [messageInput, activeConversationId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleEmoji = useCallback((emoji: string) => {
    setMessageInput((prev) => prev + emoji);
  }, []);

  return (
    <>
    <SEO title="Messages" description="Send and receive messages with other FocusLinks community members." keywords="messages, chat, direct messages, community messaging" />
    <div className="h-[calc(100vh-64px)] bg-gray-50 dark:bg-slate-950 flex flex-col">
      <div className="flex-1 flex h-full overflow-hidden">
        {/* ─── Left Sidebar ─────────────────────────────── */}
        <div
          className={`w-full md:w-80 lg:w-[360px] shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl flex flex-col ${
            mobileShowChat && activeConversationId
              ? 'hidden md:flex'
              : 'flex'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Messages
              </h1>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowNewMsgMenu(!showNewMsgMenu)}
                  className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 transition-all shadow-md shadow-purple-600/20"
                  aria-label="New"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showNewMsgMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20"
                    >
                      <button
                        onClick={handleNewMessage}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <UserPlus className="w-4 h-4 text-purple-500" />
                        New Message
                      </button>
                      <button
                        onClick={() => {
                          setShowNewMsgMenu(false);
                          setGroupModalKey((k) => k + 1);
                          setShowCreateGroup(true);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Users className="w-4 h-4 text-purple-500" />
                        New Group
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 p-6 text-center">
                <MessagesSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {conversations.length === 0
                    ? 'No conversations yet'
                    : 'No conversations found'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                  {conversations.length === 0
                    ? 'Create a group to get started'
                    : 'Try a different search'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv, idx) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-gray-50 dark:border-gray-800/50 ${
                    conv.id === activeConversationId
                      ? 'bg-purple-50 dark:bg-purple-900/15 border-l-2 border-l-purple-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-2 border-l-transparent'
                  }`}
                >
                  <Avatar
                    initials={conv.initials}
                    gradient={conv.gradient}
                    online={conv.isGroup ? false : conv.online}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`text-sm font-semibold truncate ${
                            conv.id === activeConversationId
                              ? 'text-purple-700 dark:text-purple-300'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {conv.name}
                        </span>
                        {conv.isGroup && (
                          <Users className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
                        {conv.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conv.lastMessage}
                      </p>
                      {conv.unread > 0 && (
                        <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* ─── Main Chat Area ───────────────────────────── */}
        <div
          className={`flex-1 flex flex-col bg-gray-50 dark:bg-slate-950 ${
            mobileShowChat && activeConversationId ? 'flex' : 'hidden md:flex'
          }`}
        >
          {!activeConversationId ? (
            <EmptyState />
          ) : (
            <>
              {/* Chat Header */}
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="shrink-0 px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 flex items-center gap-3"
              >
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                <Avatar
                  initials={activeConversation.initials}
                  gradient={activeConversation.gradient}
                  online={activeConversation.isGroup ? false : activeConversation.online}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {activeConversation.name}
                    </h2>
                    {activeConversation.isGroup && (
                      <Users className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeConversation.role}
                    {!activeConversation.isGroup && (
                      <>
                        <span className="mx-1.5 text-gray-300 dark:text-gray-600">
                          &bull;
                        </span>
                        {activeConversation.online ? (
                          <span className="text-emerald-500 font-medium">
                            Online
                          </span>
                        ) : (
                          <span className="text-gray-400">Offline</span>
                        )}
                      </>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => toast.info('Profile view coming soon!')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
              </motion.div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeConversationId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(messages[activeConversationId] || []).map((msg) => (
                      <div key={msg.id}>
                        {msg.dateSeparator && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                              {msg.dateSeparator}
                            </span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                          </div>
                        )}
                        <MessageBubble message={msg} />
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Message Input */}
              <div className="shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800">
                {/* Emoji Quick Access */}
                <AnimatePresence>
                  {showEmojis && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="px-4 pt-3"
                    >
                      <div className="flex gap-2">
                        {QUICK_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmoji(emoji)}
                            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-3 flex items-end gap-2">
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setShowEmojis(!showEmojis)}
                      className={`p-2 rounded-lg transition-colors ${
                        showEmojis
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      aria-label="Emoji"
                    >
                      <SmilePlus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        toast.info('File attachments coming soon!')
                      }
                      className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Attach file"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className={`p-2.5 rounded-xl transition-all shrink-0 ${
                      messageInput.trim()
                        ? 'bg-gradient-to-br from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 shadow-md shadow-purple-600/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Start New Message FAB (mobile) ─────────────── */}
      <AnimatePresence>
        {!mobileShowChat && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setGroupModalKey((k) => k + 1);
              setShowCreateGroup(true);
            }}
            className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center"
            aria-label="Create group"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Create Group Modal ──────────────────────────── */}
      <AnimatePresence>
        {showCreateGroup && (
          <CreateGroupModal
            key={groupModalKey}
            open={showCreateGroup}
            onClose={() => setShowCreateGroup(false)}
            onCreate={handleCreateGroup}
          />
        )}
      </AnimatePresence>
    </div>
  </>
  );
}
