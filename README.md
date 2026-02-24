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
- [x] User adds a url to channel on formr
  - [x] regex to get channelHandle
  - [x] POST to collec-chans

## Misc

- [x] Backend response statusCode and json convention check
- [x] DB nulls
- [x] Finish TODO : Handle errors gracefully parts
- [x] Domain
- [x] remove backend prints
- [x] DigitalOcean
- [x] collection name truncate

- [x] Make new projects(dev, prod)
- [ ] Document how to restart project
- [x] Enable dev, prod authentication
- [x] Create dev db, project(document everything)
  - [x] tables, schema, rules create
  - [x] test
- [x] Create prod db, project
  - [x] tables, schema, rules create
  - [x] put on do
  - [x] test

- [x] refactor yt api call into a util function
- [x] supabase db update rule modify
- [x] inside collec-channels route, if stale channel data, call above function and update data
