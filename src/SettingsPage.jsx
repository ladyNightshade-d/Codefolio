import { useEffect, useRef, useState } from 'react';
import './settings.css';

const settingsNavigationItems = [
  { id: 'general', label: 'General', icon: GeneralIcon, href: '/profile/settings' },
  {
    id: 'edit-profile',
    label: 'Edit Profile',
    icon: EditProfileIcon,
    href: '/profile/settings/edit-profile',
  },
  { id: 'security', label: 'Security', icon: SecurityIcon, href: '/profile/settings/security' },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: NotificationIcon,
    href: '/profile/settings/notifications',
  },
];

function GeneralIcon() {
  return (
    <svg
      aria-hidden="true"
      className="settings-page__nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="8" r="3.2" />
      <path d="M6.5 18.4c1.1-3 3-4.5 5.5-4.5s4.4 1.5 5.5 4.5" />
    </svg>
  );
}

function EditProfileIcon() {
  return (
    <svg
      aria-hidden="true"
      className="settings-page__nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="9.2" r="2.3" />
      <path d="M8.1 16.3c.9-1.9 2.2-2.9 3.9-2.9s3 .9 3.9 2.9" />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg
      aria-hidden="true"
      className="settings-page__nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="12" r="3.4" />
      <path d="M11.4 12H20" />
      <path d="M16.5 12v2.8" />
      <path d="M18.8 12v1.9" />
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg
      aria-hidden="true"
      className="settings-page__nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8.4 17.3h7.2" />
      <path d="M9.3 18.2a2.7 2.7 0 0 0 5.4 0" />
      <path d="M7.7 17.3V11a4.3 4.3 0 1 1 8.6 0v6.3" />
      <path d="M6.1 17.3h11.8" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      className="settings-page__logout-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.5 7.2H8.4a1.9 1.9 0 0 0-1.9 1.9v5.8a1.9 1.9 0 0 0 1.9 1.9h5.1" />
      <path d="M12.7 12h7.1" />
      <path d="m17 8.3 3.7 3.7-3.7 3.7" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="settings-page__google-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.8 12.3c0-.7-.1-1.3-.2-1.9H12v3.7h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.8 3.1-4.3 3.1-7.5Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.7A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.2 13.7a6.1 6.1 0 0 1 0-3.4V7.6H2.9a10 10 0 0 0 0 8.8l3.3-2.7Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6a5.4 5.4 0 0 1 3.8 1.5l2.8-2.8A9.7 9.7 0 0 0 12 2a10 10 0 0 0-9.1 5.6l3.3 2.7C7 7.8 9.3 6 12 6Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="settings-page__search-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="6.1" />
      <path d="m15.7 15.7 4.1 4.1" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="settings-page__plus-icon"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 4.2v11.6" />
      <path d="M4.2 10h11.6" />
    </svg>
  );
}

const defaultNotificationPreferences = {
  newProjectComments: true,
  mentionsInDiscussions: true,
  projectLikesAndBookmarks: false,
  cohortUpdates: true,
  newProjectsInYourStack: false,
};

const defaultEducationItems = [
  {
    id: 'education-1',
    title: 'Rwanda Coding Academy',
    meta: 'Software Engineering',
    period: '2021 - Present',
  },
];

function serializeList(items) {
  return (items || []).join(', ');
}

function normalizeListInput(value, { lowercase = false } = {}) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (lowercase ? item.toLowerCase() : item));
}

function createGeneralFormState(profile) {
  return {
    username: profile?.username || '',
    email: profile?.accountEmail || '',
  };
}

function createProfileFormState(profile) {
  return {
    fullName: profile?.name || '',
    role: profile?.role || '',
    location: profile?.location || '',
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    skills: serializeList(profile?.skills),
    specialties: serializeList(profile?.specialties),
    displayEmail: profile?.contact?.email || '',
    phoneNumber: profile?.contact?.phone || '',
    website: profile?.contact?.website || '',
    githubUrl: profile?.contact?.github || '',
    linkedinUrl: profile?.contact?.linkedin || '',
  };
}

function SettingsPage({
  toAppHref,
  section = 'general',
  profile,
  onSaveGeneral,
  onSaveProfile,
  onSaveSecurity,
  onSaveNotifications,
}) {
  const fileInputRef = useRef(null);
  const [generalFormData, setGeneralFormData] = useState(() => createGeneralFormState(profile));
  const [securityFormData, setSecurityFormData] = useState({
    password: '',
  });
  const [notificationPreferences, setNotificationPreferences] = useState(
    () => profile?.notifications || defaultNotificationPreferences
  );
  const [profileFormData, setProfileFormData] = useState(() => createProfileFormState(profile));
  const [educationItems, setEducationItems] = useState(
    () => profile?.education || defaultEducationItems
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(profile?.image ?? '/me.png');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl.startsWith('blob:') && avatarPreviewUrl !== profile?.image) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl, profile?.image]);

  useEffect(() => {
    setGeneralFormData(createGeneralFormState(profile));
    setNotificationPreferences(profile?.notifications || defaultNotificationPreferences);
    setProfileFormData(createProfileFormState(profile));
    setEducationItems(profile?.education || defaultEducationItems);
    setAvatarPreviewUrl(profile?.image ?? '/me.png');
    setSelectedAvatarFile(null);
  }, [profile]);

  function handleGeneralInputChange(event) {
    const { name, type, checked, value } = event.target;
    setGeneralFormData((currentData) => ({
      ...currentData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleProfileInputChange(event) {
    const { name, value } = event.target;
    setProfileFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSecurityInputChange(event) {
    const { name, value } = event.target;
    setSecurityFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function toggleNotificationPreference(preferenceName) {
    setNotificationPreferences((currentPreferences) => ({
      ...currentPreferences,
      [preferenceName]: !currentPreferences[preferenceName],
    }));
  }

  function handleAvatarUpload(event) {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    setSelectedAvatarFile(file);
    setAvatarPreviewUrl((currentUrl) => {
      if (currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }

      return URL.createObjectURL(file);
    });
    event.target.value = '';
  }

  function handleDeleteAvatar() {
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl((currentUrl) => {
      if (currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }

      return '';
    });
  }

  function handleGeneralSubmit(event) {
    event.preventDefault();

    onSaveGeneral?.({
      username: generalFormData.username.trim(),
      accountEmail: generalFormData.email.trim(),
    });
  }

  function handleProfileSubmit(event) {
    event.preventDefault();

    onSaveProfile?.({
      name: profileFormData.fullName.trim(),
      role: profileFormData.role.trim(),
      location: profileFormData.location.trim(),
      headline: profileFormData.headline.trim(),
      bio: profileFormData.bio.trim(),
      skills: normalizeListInput(profileFormData.skills),
      specialties: normalizeListInput(profileFormData.specialties, { lowercase: true }),
      image: avatarPreviewUrl,
      avatarFile: selectedAvatarFile,
      education: educationItems,
      contact: {
        email: profileFormData.displayEmail.trim(),
        phone: profileFormData.phoneNumber.trim(),
        website: profileFormData.website.trim(),
        github: profileFormData.githubUrl.trim(),
        linkedin: profileFormData.linkedinUrl.trim(),
      },
    });
  }

  function handleSecuritySubmit(event) {
    event.preventDefault();

    onSaveSecurity?.({
      password: securityFormData.password,
    });
  }

  function handleNotificationsSubmit(event) {
    event.preventDefault();

    onSaveNotifications?.(notificationPreferences);
  }

  function addEducationItem() {
    setEducationItems((currentItems) => [
      ...currentItems,
      {
        id: `education-${Date.now()}`,
        title: 'New education item',
        meta: 'Institution',
        period: 'Year range',
      },
    ]);
  }

  function removeEducationItem(itemId) {
    setEducationItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  }

  const activeSection =
    section === 'edit-profile' || section === 'security' || section === 'notifications'
      ? section
      : 'general';
  const isGeneralSection = activeSection === 'general';
  const isEditProfileSection = activeSection === 'edit-profile';
  const isSecuritySection = activeSection === 'security';
  const isNotificationsSection = activeSection === 'notifications';

  function renderGeneralForm() {
    return (
      <form className="settings-page__form" onSubmit={handleGeneralSubmit}>
        <label className="settings-page__field">
          <span className="settings-page__label">Username</span>
          <input
            className="settings-page__input"
            type="text"
            name="username"
            value={generalFormData.username}
            onChange={handleGeneralInputChange}
          />
        </label>

        <label className="settings-page__field">
          <span className="settings-page__label">Account Email</span>
          <input
            className="settings-page__input"
            type="email"
            name="email"
            value={generalFormData.email}
            onChange={handleGeneralInputChange}
          />
        </label>

        <section className="settings-page__section" aria-labelledby="settings-connected-heading">
          <h2 className="settings-page__section-title" id="settings-connected-heading">
            Connected Accounts
          </h2>

          <div className="settings-page__connection">
            <GoogleIcon />
            <span>Google</span>
          </div>
        </section>

        <div className="settings-page__actions">
          <button className="settings-page__save-button" type="submit">
            Save Changes
          </button>
        </div>
      </form>
    );
  }

  function renderEditProfileForm() {
    return (
      <form
        className="settings-page__form settings-page__form--edit-profile"
        onSubmit={handleProfileSubmit}
      >
        <input
          ref={fileInputRef}
          className="settings-page__hidden-input"
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
        />

        <section className="settings-page__profile-hero" aria-label="Profile picture">
          <div className="settings-page__avatar-group">
            <div className="settings-page__profile-avatar">
              {avatarPreviewUrl ? (
                <img src={avatarPreviewUrl} alt="Profile preview" />
              ) : (
                <span>YS</span>
              )}
            </div>

            <div className="settings-page__avatar-actions">
              <button
                className="settings-page__avatar-button"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload new picture
              </button>
              <button
                className="settings-page__avatar-delete"
                type="button"
                onClick={handleDeleteAvatar}
              >
                Delete
              </button>
            </div>
          </div>
        </section>

        <label className="settings-page__field">
          <span className="settings-page__label">Name</span>
          <input
            className="settings-page__input"
            type="text"
            name="fullName"
            value={profileFormData.fullName}
            onChange={handleProfileInputChange}
          />
        </label>

        <label className="settings-page__field">
          <span className="settings-page__label">Role</span>
          <input
            className="settings-page__input"
            type="text"
            name="role"
            value={profileFormData.role}
            onChange={handleProfileInputChange}
          />
        </label>

        <label className="settings-page__field">
          <span className="settings-page__label">Location</span>
          <div className="settings-page__input-shell">
            <SearchIcon />
            <input
              className="settings-page__input settings-page__input--shell"
              type="text"
              name="location"
              value={profileFormData.location}
              onChange={handleProfileInputChange}
            />
          </div>
        </label>

        <label className="settings-page__field">
          <span className="settings-page__label">Headline</span>
          <input
            className="settings-page__input"
            type="text"
            name="headline"
            value={profileFormData.headline}
            onChange={handleProfileInputChange}
          />
        </label>

        <label className="settings-page__field settings-page__field--bio">
          <span className="settings-page__label">Bio</span>
          <textarea
            className="settings-page__textarea"
            name="bio"
            value={profileFormData.bio}
            onChange={handleProfileInputChange}
          />
        </label>

        <div className="settings-page__contact-grid">
          <label className="settings-page__field">
            <span className="settings-page__label settings-page__label--small">Skills</span>
            <input
              className="settings-page__input"
              type="text"
              name="skills"
              value={profileFormData.skills}
              onChange={handleProfileInputChange}
              placeholder="React, Node.js, Design Systems"
            />
          </label>

          <label className="settings-page__field">
            <span className="settings-page__label settings-page__label--small">Specialties</span>
            <input
              className="settings-page__input"
              type="text"
              name="specialties"
              value={profileFormData.specialties}
              onChange={handleProfileInputChange}
              placeholder="web, mobile, ai"
            />
          </label>
        </div>

        <section
          className="settings-page__section settings-page__section--divided"
          aria-labelledby="settings-education-heading"
        >
          <h2
            className="settings-page__section-title settings-page__section-title--large"
            id="settings-education-heading"
          >
            Education
          </h2>

          {educationItems.map((item) => (
            <article key={item.id} className="settings-page__experience-card">
              <button
                className="settings-page__experience-remove"
                type="button"
                aria-label={`Remove ${item.title}`}
                onClick={() => removeEducationItem(item.id)}
              >
                x
              </button>
              <h3 className="settings-page__experience-title">{item.title}</h3>
              <p className="settings-page__experience-meta">
                {item.meta} <span aria-hidden="true">{'\u2022'}</span> {item.period}
              </p>
            </article>
          ))}

          <div className="settings-page__inline-actions">
            <button className="settings-page__text-action" type="button" onClick={addEducationItem}>
              <PlusIcon />
              <span>Add education</span>
            </button>
          </div>
        </section>

        <section
          className="settings-page__section settings-page__section--divided"
          aria-labelledby="settings-contact-details-heading"
        >
          <h2
            className="settings-page__section-title settings-page__section-title--large"
            id="settings-contact-details-heading"
          >
            Contact Details
          </h2>

          <p className="settings-page__section-copy">
            You can add and display your contact details on your profile to make it easier for people to reach out.
          </p>

          <div className="settings-page__contact-grid">
            <label className="settings-page__field">
              <span className="settings-page__label settings-page__label--small">Display Email</span>
              <input
                className="settings-page__input"
                type="email"
                name="displayEmail"
                value={profileFormData.displayEmail}
                onChange={handleProfileInputChange}
              />
            </label>

            <label className="settings-page__field">
              <span className="settings-page__label settings-page__label--small">Website</span>
              <input
                className="settings-page__input"
                type="url"
                name="website"
                value={profileFormData.website}
                onChange={handleProfileInputChange}
              />
            </label>

            <label className="settings-page__field">
              <span className="settings-page__label settings-page__label--small">Phone Number</span>
              <input
                className="settings-page__input"
                type="text"
                name="phoneNumber"
                value={profileFormData.phoneNumber}
                onChange={handleProfileInputChange}
              />
            </label>

            <label className="settings-page__field">
              <span className="settings-page__label settings-page__label--small">GitHub</span>
              <input
                className="settings-page__input"
                type="url"
                name="githubUrl"
                value={profileFormData.githubUrl}
                onChange={handleProfileInputChange}
              />
            </label>

            <label className="settings-page__field">
              <span className="settings-page__label settings-page__label--small">LinkedIn</span>
              <input
                className="settings-page__input"
                type="url"
                name="linkedinUrl"
                value={profileFormData.linkedinUrl}
                onChange={handleProfileInputChange}
              />
            </label>
          </div>
        </section>

        <div className="settings-page__actions settings-page__actions--edit-profile">
          <button className="settings-page__save-button settings-page__save-button--profile" type="submit">
            Save Profile
          </button>
        </div>
      </form>
    );
  }

  function renderSecurityForm() {
    return (
      <form className="settings-page__form settings-page__form--security" onSubmit={handleSecuritySubmit}>
        <label className="settings-page__field settings-page__field--security-password">
          <span className="settings-page__label">Password</span>
          <input
            className="settings-page__input settings-page__input--security"
            type="password"
            name="password"
            value={securityFormData.password}
            onChange={handleSecurityInputChange}
          />
        </label>

        <div className="settings-page__security-actions">
          <button className="settings-page__save-button settings-page__save-button--security" type="submit">
            Save
          </button>
        </div>

        <section
          className="settings-page__section settings-page__section--security-danger"
          aria-labelledby="settings-delete-account-heading"
        >
          <h2
            className="settings-page__section-title settings-page__section-title--large"
            id="settings-delete-account-heading"
          >
            Delete Codefolio Account
          </h2>

          <p className="settings-page__section-copy settings-page__section-copy--danger">
            Deleting your account will permanently remove your Codefolio profile and all associated content.
            This action cannot be reversed.
          </p>

          <div className="settings-page__security-danger-actions">
            <button className="settings-page__danger-button" type="button">
              Delete Account
            </button>
          </div>
        </section>
      </form>
    );
  }

  function renderNotificationToggle(title, description, preferenceName) {
    const isEnabled = notificationPreferences[preferenceName];

    return (
      <div className="settings-page__notification-row">
        <div className="settings-page__notification-copy">
          <h3 className="settings-page__notification-title">{title}</h3>
          <p className="settings-page__notification-description">{description}</p>
        </div>

        <button
          className={`settings-page__toggle ${isEnabled ? 'settings-page__toggle--active' : ''}`}
          type="button"
          role="switch"
          aria-checked={isEnabled}
          onClick={() => toggleNotificationPreference(preferenceName)}
        >
          <span className="settings-page__toggle-handle" />
        </button>
      </div>
    );
  }

  function renderNotificationsForm() {
    return (
      <form
        className="settings-page__form settings-page__form--notifications"
        onSubmit={handleNotificationsSubmit}
      >
        <section
          className="settings-page__notifications-group"
          aria-labelledby="settings-email-notifications-heading"
        >
          <h2
            className="settings-page__section-title settings-page__section-title--notifications"
            id="settings-email-notifications-heading"
          >
            Email Notifications
          </h2>

          <div className="settings-page__notification-list">
            {renderNotificationToggle(
              'New project comments',
              'Get notified when someone leaves a comment on your work.',
              'newProjectComments'
            )}
            {renderNotificationToggle(
              'Mentions in discussions',
              'Alerts when you are @mentioned in community threads.',
              'mentionsInDiscussions'
            )}
            {renderNotificationToggle(
              'Project likes and bookmarks',
              'Daily digest of engagement on your portfolio pieces.',
              'projectLikesAndBookmarks'
            )}
          </div>
        </section>

        <section
          className="settings-page__notifications-group settings-page__notifications-group--secondary"
          aria-labelledby="settings-platform-activity-heading"
        >
          <h2
            className="settings-page__section-title settings-page__section-title--notifications"
            id="settings-platform-activity-heading"
          >
            Platform Activity
          </h2>

          <div className="settings-page__notification-list">
            {renderNotificationToggle(
              'Cohort updates',
              'News and announcements from your graduating class.',
              'cohortUpdates'
            )}
            {renderNotificationToggle(
              'New projects in your stack',
              'Discover new work matching your technical interests.',
              'newProjectsInYourStack'
            )}
          </div>
        </section>

        <div className="settings-page__actions settings-page__actions--notifications">
          <button
            className="settings-page__save-button settings-page__save-button--notifications"
            type="submit"
          >
            Save Preferences
          </button>
        </div>
      </form>
    );
  }

  return (
    <section className="settings-page" aria-labelledby="settings-page-heading">
      <div className="settings-page__layout">
        <aside className="settings-page__sidebar" aria-label="Account settings navigation">
          <p className="settings-page__sidebar-title">Account Settings</p>

          <nav className="settings-page__nav">
            {settingsNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              if (item.href) {
                return (
                  <a
                    key={item.id}
                    className={`settings-page__nav-link ${
                      isActive
                        ? 'settings-page__nav-link--active'
                        : 'settings-page__nav-link--inactive-link'
                    }`}
                    href={toAppHref(item.href)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  className="settings-page__nav-link settings-page__nav-link--inactive"
                  type="button"
                  disabled
                >
                  <Icon />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <a className="settings-page__logout" href={toAppHref('/logout')}>
            <LogoutIcon />
            <span>Logout</span>
          </a>
        </aside>

        <div
          className={`settings-page__content ${
            isEditProfileSection ? 'settings-page__content--edit-profile' : ''
          }`}
        >
          <header
            className={`settings-page__header ${
              isEditProfileSection ? 'settings-page__header--edit-profile' : ''
            }`}
          >
            <h1 className="settings-page__title" id="settings-page-heading">
              {isNotificationsSection ? (
                <span>Notifications</span>
              ) : (
                <>
                  <span>{profile?.name} / </span>
                  <span className="settings-page__title-muted">
                    {isGeneralSection ? 'General' : isSecuritySection ? 'Security' : 'Edit Profile'}
                  </span>
                </>
              )}
            </h1>
            {isGeneralSection ? (
              <p className="settings-page__copy">Update your username and manage your account email</p>
            ) : null}
          </header>

          {isGeneralSection
            ? renderGeneralForm()
            : isSecuritySection
              ? renderSecurityForm()
              : isNotificationsSection
                ? renderNotificationsForm()
              : renderEditProfileForm()}
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;
