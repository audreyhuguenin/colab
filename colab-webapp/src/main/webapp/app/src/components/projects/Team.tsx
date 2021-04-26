/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';

import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { Project, TeamMember } from 'colab-rest-client';
import { StateStatus } from '../../store/project';
import InlineLoading from '../common/InlineLoading';
import { getProjectTeam, getUser, sendInvitation } from '../../API/api';
import { getDisplayName } from '../../helper';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { linkStyle } from '../styling/style';
import IconButton from '../common/IconButton';

export interface MemberProps {
  member: TeamMember;
}

const Member = (props: MemberProps) => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(state => {
    if (props.member.userId != null) {
      return state.users.users[props.member.userId];
    } else {
      // no user id looks like a pending invitation
      return null;
    }
  });

  if (props.member.userId == null) {
    return <li>Invitation is pending...</li>;
  } else if (user == null) {
    if (props.member.userId && user === undefined) {
      dispatch(getUser(props.member.userId));
    }
    return (
      <li>
        <InlineLoading />
      </li>
    );
  } else {
    return <li>{getDisplayName(user)}</li>;
  }
};

export interface Props {
  project: Project;
}

export default (props: Props): JSX.Element => {
  const dispatch = useAppDispatch();

  const { members, status } = useAppSelector(state => {
    const r: { members: TeamMember[]; status: StateStatus } = {
      members: [],
      status: 'NOT_INITIALIZED',
    };
    const projectId = props.project.id;

    if (projectId != null && state.projects.teams[projectId]) {
      const team = state.projects.teams[projectId];
      r.status = team.status;
      r.members = Object.values(team.members);
    }

    return r;
  });

  const [invite, setInvite] = React.useState('');

  if (status === 'NOT_INITIALIZED') {
    // Load team members from server
    if (props.project.id != null) {
      dispatch(getProjectTeam(props.project.id));
    }
  }
  const title = <h3>Team Members</h3>;

  if (status === 'INITIALIZED') {
    return (
      <div>
        {title}
        <ul>
          {members.map(member => (
            <Member key={member.id} member={member} />
          ))}
        </ul>
        <div>
          <label>
            Invite:
            <input type="text" onChange={e => setInvite(e.target.value)} value={invite} />
          </label>
          <IconButton
            className={linkStyle}
            icon={faPaperPlane}
            onClick={() =>
              dispatch(
                sendInvitation({
                  projectId: props.project.id!,
                  recipient: invite,
                }),
              ).then(() => setInvite(''))
            }
          />
        </div>
      </div>
    );
  } else {
    return (
      <div>
        {title}
        <InlineLoading />;
      </div>
    );
  }
};
