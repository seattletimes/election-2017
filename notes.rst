Election 2015 Notes
===================

This is a list of errors that caught us off guard while working on the 2015 election app. These are good things to keep in mind as long as we continue pulling from the WASOS and King County feeds.

- Sort races and check for duplicates - It's easy to end up with multiple copies of a race if it exists in both the King and SOS. There should be only one row per race, with the SOSID *and* King County code so that we can merge results.
- Sort candidates and check for duplicates - It's likewise easy to end up with duplicate candidates, which will cause results to get thrown away or assigned to the wrong race. Make sure each candidate only appears once.
- Keep track of the multi-county races and spit out a warning for them - Races that are in both King and SOS are often multi-county races. Make sure to check for anything that matches that description. It's possible for results at a higher level to block multi-county results from being aggregated properly.

It would be a very good idea to write a task to check for misconfiguration -- missing race codes, duplicate codes, bad multi-county races -- by pulling the config spreadsheet and running it through a validator of some kind.

Note on the data flow for results:

1. All results are pulled
2. Races are sorted and categorized, including subcategories and featured races
3. Statewide results are added
4. King County results are added unless the sosRaceID field means that it comes from the SOS instead
5. County data from the SOS is aggregated and added if there were no state or King results
6. By-county map data is added in a second pass, for any flagged race
7. Overrides are processed, if any exist