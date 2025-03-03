// src/views/ChatView.js
import React, { useEffect } from "react";
import { useChatViewModel } from "../viewmodels/chatViewModel";
import { useAuthViewModel } from "../viewmodels/authViewModel";
import { useNotificationViewModel } from "../viewmodels/notificationViewModel";
import { useAuth } from "../AuthContext";
import { useRef } from "react";
import {
  Container,
  Row,
  Col,
  Tab,
  Nav,
  Image,
  ListGroup,
  Form,
  Button,
  Modal,
} from "react-bootstrap";
import "../styles/ChatView.css";
import { FaUserFriends, FaUserPlus, FaUserMinus } from "react-icons/fa";
import {
  MdChat,
  MdSend,
  MdKeyboardArrowRight,
  MdKeyboardArrowDown,
  MdEdit,
  MdMessage,
  MdCake,
} from "react-icons/md";
import { FiCompass } from "react-icons/fi";
import { BsBell, BsBellSlash, BsChatDots } from "react-icons/bs";
import { set } from "firebase/database";

const LoadingSpinner = () => {
  return (
    <div className="loader">
      <div className="loader-circle"></div>
      <div className="loader-text">Loading...</div>
    </div>
  );
};

const ChatView = () => {
  const [isFriendVisible, setIsFriendVisible] = React.useState(true);
  const [isNonFriendVisible, setIsNonFriendVisible] = React.useState(true);
  const [showUnsendConfirmModal, setShowUnsendConfirmModal] =
    React.useState(false);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] =
    React.useState(false);
  const [selectedMessageId, setSelectedMessageId] = React.useState(null);
  const [removeFriendId, setRemoveFriendId] = React.useState(null);
  const endOfMessagesRef = useRef(null);

  const { currentUser } = useAuth();
  const { handleSignOut } = useAuthViewModel();
  const { notificationEnabled, handleRequestPermission } =
    useNotificationViewModel();
  const {
    chatId,
    friends,
    nonFriends,
    selectedFriend,
    messages,
    message,
    activeKey,
    profileToShow,
    tempUserProfile,
    isLoading,
    userProfile,
    messageIsLoading,
    setProfileToShow,
    setTempUserProfile,
    setActiveKey,
    setMessage,
    handleSelectFriend,
    handleRemoveFriend,
    handleAddFriend,
    handleMessageSend,
    handleUpdateUserProfile,
    handleChangeUserProfile,
    handleCloseProfile,
    handleShowProfile,
    handleMessageUnsend,
  } = useChatViewModel();

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "instant" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUnsendClick = (messageId) => {
    setSelectedMessageId(messageId);
    setShowUnsendConfirmModal(true);
  };

  const handleRemoveFriendClick = (friendId) => {
    setRemoveFriendId(friendId);
    setShowRemoveConfirmModal(true);
  };

  const confirmUnsend = (messageId) => {
    handleMessageUnsend(messageId);
    setShowUnsendConfirmModal(false);
  };

  const confirmRemoveFriend = (friendId) => {
    handleRemoveFriend(friendId);
    setShowRemoveConfirmModal(false);
  };

  const nameInputRef = useRef(null);

  const handleFileChange = (e) => {
    handleChangeUserProfile(e);
  };

  if (!currentUser || !userProfile || isLoading) {
    console.log("currentUser", currentUser);
    console.log("userProfile", userProfile);
    console.log("isLoading", isLoading);
    return <LoadingSpinner />;
  } else {
    return (
      <Container fluid>
        <Row className="mb-3 align-items-center justify-content-end top-row">
          <Col xs="auto">
            <Image
              src={userProfile.avatar}
              roundedCircle
              style={{ width: "50px", height: "50px", borderRadius: "50%" }}
            />
          </Col>
          <Col xs="auto">{userProfile.name}</Col>
          {/* <Col xs="auto">
            <Button variant="link" onClick={() => handleRequestPermission()}>
              {notificationEnabled ? <BsBellSlash /> : <BsBell />}
            </Button>
          </Col> */}

          {currentUser && (
            <Col xs="auto">
              <Button
                variant="outline-secondary"
                onClick={(e) => handleSignOut(e)}
                className="log-out-btn"
              >
                Log Out
              </Button>
            </Col>
          )}
        </Row>
        {profileToShow.visible && (
          <Modal
            show={profileToShow.visible}
            onHide={handleCloseProfile}
            centered
          >
            <Modal.Header closeButton />
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                if (profileToShow.editable) {
                  handleUpdateUserProfile();
                }
              }}
            >
              <Modal.Body>
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <img
                    src={profileToShow.userData.avatar}
                    alt="Avatar"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <Form.Group>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Form.Control
                      type="text"
                      name="name"
                      ref={nameInputRef}
                      value={
                        profileToShow.editable
                          ? tempUserProfile.name
                          : profileToShow.userData.name
                      }
                      onChange={handleChangeUserProfile}
                      readOnly={!profileToShow.editable}
                      onFocus={(e) => {
                        if (profileToShow.editable) {
                          e.target.select();
                        } else {
                          e.target.blur();
                        }
                      }}
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        textAlign: "center",
                        border: "none",
                      }}
                    />
                  </div>
                </Form.Group>
                {currentUser.id === profileToShow.userData.id && (
                  <Form.Group style={{ marginBottom: "10px" }}>
                    <Form.Label>Upload Avatar</Form.Label>
                    <Form.Control
                      type="file"
                      name="avatar"
                      onChange={handleFileChange}
                      readOnly={!profileToShow.editable}
                    />
                  </Form.Group>
                )}
                <Form.Group style={{ marginBottom: "10px" }}>
                  <Form.Label>
                    Birthday
                    <MdCake style={{ marginLeft: "5px" }} />{" "}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="birthday"
                    value={
                      profileToShow.editable
                        ? tempUserProfile.birthday
                        : profileToShow.userData.birthday
                    }
                    onChange={(e) => handleChangeUserProfile(e)}
                    readOnly={!profileToShow.editable}
                    onFocus={(e) => {
                      if (profileToShow.editable) {
                        e.target.select();
                      } else {
                        e.target.blur();
                      }
                    }}
                    style={{ textAlign: "center" }}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>
                    Status Message
                    <MdMessage style={{ marginLeft: "5px" }} />
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="statusMessage"
                    value={
                      profileToShow.editable
                        ? tempUserProfile.statusMessage
                        : profileToShow.userData.statusMessage
                    }
                    onFocus={(e) => {
                      if (profileToShow.editable) {
                        e.target.select();
                      } else {
                        e.target.blur();
                      }
                    }}
                    onChange={(e) => handleChangeUserProfile(e)}
                    readOnly={!profileToShow.editable}
                  />
                </Form.Group>
              </Modal.Body>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginRight: "20px",
                }}
              >
                {profileToShow.editable && (
                  <Button
                    variant="primary"
                    type="submit"
                    className="save-changes-btn"
                  >
                    Save Changes
                  </Button>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginRight: "20px",
                }}
              >
                {profileToShow.userData.id !== currentUser.id &&
                  profileToShow.isFriend && (
                    <Button
                      variant="link"
                      onClick={() => {
                        setActiveKey("chats");
                        handleSelectFriend(profileToShow.userData);
                        setProfileToShow({ visible: false });
                      }}
                      className="goto-chat-btn"
                      style={{
                        color: "#274c77",
                        textDecoration: "none",
                        marginBottom: "20px",
                      }}
                    >
                      <BsChatDots size={50} style={{ marginRight: 8 }} /> Go to
                      Chat
                    </Button>
                  )}
              </div>
            </Form>
          </Modal>
        )}

        <Row style={{ margin: "0", padding: "0" }}>
          <Col md={3} className="left-col" style={{ position: "relative" }}>
            <Tab.Container
              activeKey={activeKey}
              onSelect={(k) => setActiveKey(k)}
            >
              <Row>
                <Col sm={12} className="nav-justified">
                  <Nav variant="tabs" className="flex-row">
                    <Nav.Item className="nav-item">
                      <Nav.Link eventKey="friends" className="nav-link">
                        <FaUserFriends className="nav-link-icon" />
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className="nav-item">
                      <Nav.Link eventKey="chats" className="nav-link">
                        <MdChat className="nav-link-icon" />
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className="nav-item">
                      <Nav.Link eventKey="explore" className="nav-link">
                        <FiCompass className="nav-link-icon" />
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
                <Col sm={12}>
                  <Tab.Content>
                    <Tab.Pane eventKey="friends">
                      {currentUser && (
                        <Col
                          xs="auto"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "20px",
                            padding: "15px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            handleShowProfile(currentUser.id);
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#f0f0f0")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <Image
                            src={userProfile.avatar}
                            roundedCircle
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                            }}
                          />
                          <div style={{ marginLeft: "10px" }}>
                            {userProfile.name}
                          </div>
                        </Col>
                      )}
                      <h4
                        style={{
                          color: "#808080",
                          fontSize: "small",
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "15px",
                        }}
                      >
                        Friends ({friends.length})
                        <span
                          onClick={() => setIsFriendVisible(!isFriendVisible)}
                          style={{ marginLeft: "10px", cursor: "pointer" }}
                        >
                          {isFriendVisible ? (
                            <MdKeyboardArrowDown />
                          ) : (
                            <MdKeyboardArrowRight />
                          )}
                        </span>
                      </h4>

                      {isFriendVisible &&
                        (friends.length === 0 ? (
                          <div
                            style={{
                              marginLeft: "15px",
                              color: "#808080",
                              fontSize: "small",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            You have no friends yet.
                            <button
                              onClick={() => setActiveKey("explore")}
                              style={{
                                color: "#6096ba",
                                background: "none",
                                border: "none",
                                padding: 0,
                                textDecoration: "underline",
                                marginLeft: "3px",
                                marginRight: "3px",
                              }}
                            >
                              Go to explore
                            </button>{" "}
                            and add some new friends!
                          </div>
                        ) : (
                          <>
                            <ListGroup>
                              {friends.map((friend) => (
                                <ListGroup.Item
                                  key={friend.id}
                                  onClick={() => handleShowProfile(friend.id)}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "#f0f0f0")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "transparent")
                                  }
                                  className="friend-list-item"
                                >
                                  <Image
                                    src={friend.avatar ? friend.avatar : ""}
                                    roundedCircle
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      borderRadius: "50%",
                                    }}
                                  />
                                  <span style={{ marginLeft: "10px" }}>
                                    {friend.name}
                                  </span>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveFriendClick(friend.id);
                                    }}
                                    style={{
                                      position: "absolute",
                                      right: 10,
                                      top: 10,
                                    }}
                                    className="remove-friend-btn"
                                  >
                                    <FaUserMinus />
                                  </Button>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                            <Modal
                              show={showRemoveConfirmModal}
                              onHide={() => {
                                setShowRemoveConfirmModal(false);
                              }}
                              centered
                            >
                              <Modal.Header closeButton>
                                <Modal.Title>Confirm Remove</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                Are you sure you want to remove this friend?
                              </Modal.Body>
                              <Modal.Footer>
                                <Button
                                  variant="secondary"
                                  onClick={() =>
                                    setShowRemoveConfirmModal(false)
                                  }
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmRemoveFriend(removeFriendId);
                                  }}
                                >
                                  remove
                                </Button>
                              </Modal.Footer>
                            </Modal>
                          </>
                        ))}
                    </Tab.Pane>
                    <Tab.Pane eventKey="chats">
                      <ListGroup>
                        {friends.map((friend) => (
                          <ListGroup.Item
                            key={friend.id}
                            onClick={() => handleSelectFriend(friend)}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#f0f0f0")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                            className="friend-list-item"
                          >
                            <Image
                              src={friend.avatar ? friend.avatar : ""}
                              roundedCircle
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                              }}
                            />
                            <span style={{ marginLeft: "10px" }}>
                              {friend.name}
                            </span>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Tab.Pane>
                    <Tab.Pane eventKey="explore">
                      <h4
                        style={{
                          color: "#808080",
                          fontSize: "small",
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "15px",
                        }}
                      >
                        Potential Friends ({nonFriends.length})
                        <span
                          onClick={() =>
                            setIsNonFriendVisible(!isNonFriendVisible)
                          }
                          style={{ marginLeft: "10px", cursor: "pointer" }}
                        >
                          {isNonFriendVisible ? (
                            <MdKeyboardArrowDown />
                          ) : (
                            <MdKeyboardArrowRight />
                          )}
                        </span>
                      </h4>
                      {isNonFriendVisible && (
                        <ListGroup>
                          {nonFriends.map((nonFriend) => (
                            <ListGroup.Item
                              key={nonFriend.id}
                              onClick={() => handleShowProfile(nonFriend.id)}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#f0f0f0")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                              className="friend-list-item"
                            >
                              <Image
                                src={nonFriend.avatar ? nonFriend.avatar : ""}
                                roundedCircle
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                }}
                              />
                              <span style={{ marginLeft: "10px" }}>
                                {nonFriend.name}
                              </span>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddFriend(nonFriend.id);
                                }}
                                style={{
                                  position: "absolute",
                                  right: 10,
                                  top: 10,
                                }}
                                className="add-friend-btn"
                              >
                                <FaUserPlus />
                              </Button>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </Tab.Pane>
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          </Col>
          <Col
            md={9}
            className={
              selectedFriend ? "right-col-chatid" : "right-col-nochatid"
            }
          >
            {!selectedFriend && (
              <div
                style={{
                  padding: "0px",
                  margin: "0px",
                  overflowY: "auto",
                  overflowX: "hidden",
                  height: "750px",
                  backgroundColor: "#e7ecef",
                }}
              >
                <div className="empty-chat-placeholder">
                  <BsChatDots size={100} className="bounce" />
                  <p style={{ marginTop: "10px" }}>Start chatting now!</p>
                </div>
              </div>
            )}
            {selectedFriend && (
              <>
                <Row className="mb-2 align-items-center selected-friend-name">
                  <Col xs="auto">{selectedFriend.name}</Col>
                </Row>
                <div
                  style={{
                    padding: "0px",
                    margin: "0px",
                    overflowY: "auto",
                    overflowX: "hidden",
                    height: "530px",
                    backgroundColor: "#e7ecef",
                  }}
                >
                  {messageIsLoading ? (
                    <div className="centered-spinner">
                      <LoadingSpinner />
                    </div>
                  ) : null}
                  {messages.map((msg) => {
                    if (msg.isUnsent) {
                      return null;
                    }
                    const isCurrentUser = msg.from === currentUser.id;

                    return (
                      <Row
                        key={msg.messageId}
                        className={`
                        d-flex align-items-end
                          ${
                            isCurrentUser
                              ? "justify-content-end"
                              : "justify-content-start"
                          }
                        `}
                      >
                        {!isCurrentUser && (
                          <Col xs="auto">
                            <Image
                              src={selectedFriend.avatar || ""}
                              roundedCircle
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                marginBottom: "25px",
                              }}
                            />
                          </Col>
                        )}

                        {isCurrentUser && (
                          <>
                            <Col
                              xs="auto"
                              className={`message-time ${
                                isCurrentUser ? "text-right" : "text-left"
                              }`}
                              style={{
                                display: "flex",
                                alignItems: "flex-end",
                                flexDirection: "column",
                              }}
                            >
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => handleUnsendClick(msg.messageId)}
                                style={{
                                  color: "#274c77",
                                  padding: "0px",
                                  margin: "0px",
                                }}
                              >
                                unsend
                              </Button>
                              {msg.sentTime}
                            </Col>
                          </>
                        )}

                        <Col xs="auto" className="auto-width">
                          <div
                            className={`message-box ${
                              isCurrentUser
                                ? "current-user"
                                : "not-current-user"
                            }`}
                          >
                            <div
                              className={`${
                                isCurrentUser ? "text-right" : "text-left"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        </Col>
                        {!isCurrentUser && (
                          <Col
                            xs="auto"
                            className={`message-time ${
                              isCurrentUser ? "align-right" : "align-left"
                            }`}
                          >
                            {msg.sentTime}
                          </Col>
                        )}
                      </Row>
                    );
                  })}
                  <div ref={endOfMessagesRef} />
                  <Modal
                    show={showUnsendConfirmModal}
                    onHide={() => setShowUnsendConfirmModal(false)}
                    centered
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Confirm Unsend</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      Are you sure you want to unsend this message?
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        variant="secondary"
                        onClick={() => setShowUnsendConfirmModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => confirmUnsend(selectedMessageId)}
                      >
                        Unsend
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </div>
                <Row
                  style={{ backgroundColor: "#ffffff" }}
                  className="mt-3 typing-area"
                >
                  <Form>
                    <Form.Group className="mb-2">
                      <Row>
                        <Col sm={11}>
                          <Form.Control
                            as="textarea"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="form-control"
                          />
                        </Col>
                        <Col sm={1} className="d-flex justify-content-end">
                          <Button
                            onClick={handleMessageSend}
                            className="send-btn"
                          >
                            <MdSend />
                          </Button>
                        </Col>
                      </Row>
                    </Form.Group>
                  </Form>
                </Row>
              </>
            )}
          </Col>
        </Row>
      </Container>
    );
  }
};

export default ChatView;
