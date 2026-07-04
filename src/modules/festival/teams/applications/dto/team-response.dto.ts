import { ApiProperty } from '@nestjs/swagger';

export class TeamMemberDto {
  @ApiProperty() id: string = '';
  @ApiProperty() userId: string = '';
  @ApiProperty() fullName: string = '';
  @ApiProperty() joinedAt: Date = new Date();
}

export class TeamLeaderDto {
  @ApiProperty() id: string = '';
  @ApiProperty() fullName: string = '';
  @ApiProperty() email: string = '';
}

export class TeamResponseDto {
  @ApiProperty() id: string = '';
  @ApiProperty() name: string = '';
  @ApiProperty() institution: string = '';
  @ApiProperty() leader: TeamLeaderDto = new TeamLeaderDto();
  @ApiProperty({ type: [TeamMemberDto] }) members: TeamMemberDto[] = [];
  @ApiProperty() createdAt: Date = new Date();
}
