BEGIN;

DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS roompermission;
DROP TABLE IF EXISTS room;
DROP TABLE IF EXISTS shiftpattern;
DROP TABLE IF EXISTS shiftallocation;
DROP TABLE IF EXISTS shiftexception;

CREATE TABLE profile(
    id uuid PRIMARY KEY,
    insertedAt timestamp with time zone default current_timestamp,
    updatedAt timestamp with time zone default current_timestamp,
    canLeadSessions boolean,
    firstName text,
    lastName text,
    userId uuid,
    canManageShifts boolean,
    email text,
    hubspotContactId text
);

CREATE TABLE room(
    id uuid PRIMARY KEY,
    name text,
    slug text,
    slideshowName text,
    currentSlideIndex integer,
    timerState text,
    timerStartTime timestamp with time zone,
    timerDuration bigint,
    wherebyMeetingId text,
    wherebyStartDate timestamp with time zone,
    wherebyEndDate timestamp with time zone,
    wherebyRoomUrl text,
    wherebyHostRoomUrl text,
    hubspotLeaderListId text,
    updatedAt timestamp with time zone default current_timestamp
);

CREATE TABLE roompermission(
    id uuid PRIMARY KEY,
    type text,
    updatedAt timestamp with time zone default current_timestamp,
    profileId uuid,
    roomId uuid
);

CREATE TABLE shiftexception(
    id uuid PRIMARY KEY,
    shiftPatternId uuid,
    date timestamp with time zone,
    profileId uuid,
    type text,
    lastUpdated timestamp with time zone default current_timestamp,
    shiftAllocationId uuid
);

CREATE TABLE shiftallocation(
    id uuid PRIMARY KEY,
    shiftPatternId uuid,
    profileId uuid,
    updatedAt timestamp with time zone default current_timestamp
);

CREATE TABLE shiftpattern(
    id uuid PRIMARY KEY,
    name text,
    required_people integer,
    roomId uuid,
    updatedAt timestamp with time zone default current_timestamp,
    cron text,
    allowOneOffAllocations boolean,
    cronTimezone text
);

ALTER TABLE roompermission
ADD CONSTRAINT roompermission_profile_fk
FOREIGN KEY (profileId)
REFERENCES profile (id);

ALTER TABLE roompermission
ADD CONSTRAINT roompermission_room_fk
FOREIGN KEY (roomId)
REFERENCES room (id);

ALTER TABLE shiftexception
ADD CONSTRAINT shiftexception_shiftpattern_fk
FOREIGN KEY (shiftPatternId)
REFERENCES shiftpattern (id);

ALTER TABLE shiftexception
ADD CONSTRAINT shiftexception_profile_fk
FOREIGN KEY (profileId)
REFERENCES profile (id);

ALTER TABLE shiftallocation
ADD CONSTRAINT shiftallocation_shiftpattern_fk
FOREIGN KEY (shiftPatternId)
REFERENCES shiftpattern (id);

ALTER TABLE shiftallocation
ADD CONSTRAINT shiftallocation_profile_fk
FOREIGN KEY (profileId)
REFERENCES profile (id);

ALTER TABLE shiftpattern
ADD CONSTRAINT shiftpattern_room_fk
FOREIGN KEY (roomId)
REFERENCES room (id);


COMMIT;