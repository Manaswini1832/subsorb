Site live at : [Link](https://subsorb.in/)

# Todos

- [x] Authentication
- [x] Database setup with Row Level Security
- [ ] Add indexes in db

## Collections

- [x] Users can create and get collections
- [x] Newly created collection shows up in sidebar
- [x] Users can click on sidebar collections to go to collection page(same route but different UI rendered)

## Channels, Collection-Channels

- [x] User can add non-existing channels
- [x] Fetch channels related to collections from db
  - [x] Parse the channel data to get channel name, description, url
  - [x] Display channel info in Channel card UI component
- [x] User adds a url to channel on form
  - [x] regex to get channelHandle
  - [x] POST to collec-chans

## Misc

- [ ] Backend response statusCode and json convention check
- [ ] DB nulls
- [ ] Finish TODO : Handle errors gracefully parts
- [x] Domain
- [x] remove backend prints
- [x] DigitalOcean

- [x] Make new projects(dev, prod)
- [ ] Document how to restart project
- [x] Enable dev, prod authentication
- [ ] Create dev db, project(document everything)
  - [ ] tables, schema, rules create
  - [ ] test
- [ ] Create prod db, project
  - [ ] tables, schema, rules create
  - [ ] put on do
  - [ ] test
