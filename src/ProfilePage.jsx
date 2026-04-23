import './profile.css';

const profileTabs = ['Work', 'Drafts', 'Reviews', 'Recent', 'Collections', 'Liked Shots', 'About'];

function LocationPinIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__location-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 20c-3.3-3.7-5-6.5-5-9.1a5 5 0 1 1 10 0c0 2.6-1.7 5.4-5 9.1Z" />
      <circle cx="12" cy="11" r="1.9" />
    </svg>
  );
}

function MoreDotsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__more-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="6.5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="17.5" cy="12" r="1.6" />
    </svg>
  );
}

function UploadCloudIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__upload-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7.2 18.1h8.9a3.5 3.5 0 0 0 .5-7 4.8 4.8 0 0 0-9.4-1.2A4.1 4.1 0 0 0 7.2 18Z" />
      <path d="M12 15.8V9.4" />
      <path d="m9.5 11.8 2.5-2.6 2.5 2.6" />
    </svg>
  );
}

function ProfilePage({ toAppHref }) {
  return (
    <section className="profile-page" aria-labelledby="profile-name">
      <div className="profile-page__hero">
        <img className="profile-page__avatar" src="/me.png" alt="MANZI SHIMWA Yves seraphin" />

        <h1 className="profile-page__name" id="profile-name">
          MANZI SHIMWA Yves seraphin
        </h1>

        <p className="profile-page__location">
          <LocationPinIcon />
          <span>Kigali, Rwanda</span>
        </p>

        <div className="profile-page__actions">
          <button className="profile-page__edit-button" type="button">
            Edit Profile
          </button>
          <button className="profile-page__more-button" type="button" aria-label="More profile actions">
            <MoreDotsIcon />
          </button>
        </div>
      </div>

      <div className="profile-page__tabs" role="tablist" aria-label="Profile sections">
        {profileTabs.map((tab, index) => (
          <button
            key={tab}
            className={`profile-page__tab ${index === 0 ? 'profile-page__tab--active' : ''}`}
            type="button"
            role="tab"
            aria-selected={index === 0}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="profile-page__empty-state" aria-labelledby="profile-empty-title">
        <div className="profile-page__upload-badge" aria-hidden="true">
          <UploadCloudIcon />
        </div>

        <h2 className="profile-page__empty-title" id="profile-empty-title">
          Upload your first shot
        </h2>

        <p className="profile-page__empty-copy">
          Show off your best work. Get feedback, likes and be a part of a growing community.
        </p>

        <a className="profile-page__upload-button" href={toAppHref('/profile/upload')}>
          Upload your first shot
        </a>
      </section>
    </section>
  );
}

export default ProfilePage;
