import { useEffect, useMemo, useState } from "react";
import "./messagingInterface.css";
import {
    ensureGuestUserSession,
	getActiveUser,
	getContacts,
	getConversation,
	sendMessageAndComputeReply,
} from "../services/messagingService";

function MessagingInterface({ onNavigate }) {
	const [activeUser, setActiveUser] = useState(null);
	const [contacts, setContacts] = useState([]);
	const [selectedContactId, setSelectedContactId] = useState("");
	const [messages, setMessages] = useState([]);
	const [draft, setDraft] = useState("");
	const [isSending, setIsSending] = useState(false);

	useEffect(() => {
		const currentUser = getActiveUser() || ensureGuestUserSession();
		setActiveUser(currentUser);

		if (!currentUser) {
			return;
		}

		const availableContacts = getContacts(currentUser.id);
		setContacts(availableContacts);

		if (availableContacts.length > 0) {
			const firstContactId = availableContacts[0].id;
			setSelectedContactId(firstContactId);
			setMessages(getConversation(currentUser.id, firstContactId));
		}
	}, []);

	const selectedContact = useMemo(
		() => contacts.find((contact) => contact.id === selectedContactId) || null,
		[contacts, selectedContactId]
	);

	const handleContactSelect = (contactId) => {
		setSelectedContactId(contactId);
		if (!activeUser) {
			return;
		}
		setMessages(getConversation(activeUser.id, contactId));
	};

	const handleSendMessage = async (event) => {
		event.preventDefault();
		if (!activeUser || !selectedContactId || !draft.trim() || isSending) {
			return;
		}

		setIsSending(true);

		const result = await sendMessageAndComputeReply({
			fromUserId: activeUser.id,
			toUserId: selectedContactId,
			content: draft,
		});

		if (!result.success) {
			alert(result.error);
			setIsSending(false);
			return;
		}

		setMessages(result.messages);
		setDraft("");
		setIsSending(false);
	};

	if (!activeUser) return null;

	return (
        
		<div className="messaging-shell">
            
			<aside className="messaging-sidebar">
				<h3>Signed in as</h3>
				<p className="active-user-name">{activeUser.name}</p>
				<div className="contact-list">
					{contacts.map((contact) => (
						<button
							key={contact.id}
							className={`contact-item ${
								selectedContactId === contact.id ? "selected" : ""
							}`}
							onClick={() => handleContactSelect(contact.id)}
						>
							{contact.name}
						</button>
					))}
				</div>
			</aside>

			<section className="messaging-main">
				<header className="message-header">
					<h3>{selectedContact ? `Chat with ${selectedContact.name}` : "No contact selected"}</h3>
					<p>Replies are computed by the server</p>
				</header>

				<div className="message-list">
					{messages.length === 0 ? (
						<p className="empty-text">Start a conversation.</p>
					) : (
						messages.map((message) => {
							const isOwnMessage = message.fromUserId === activeUser.id;

							return (
								<div
									key={message.id}
									className={`message-row ${isOwnMessage ? "own" : "other"}`}
								>
									<p>{message.text}</p>
								</div>
							);
						})
					)}
				</div>

				<form className="message-input-form" onSubmit={handleSendMessage}>
					<input
						type="text"
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						placeholder="Type your message"
					/>
					<button className="messaging-button" type="submit" disabled={isSending}>
						{isSending ? "Sending..." : "Send"}
					</button>
				</form>
			</section>
            
		</div>
        
	);
}

export default MessagingInterface;
