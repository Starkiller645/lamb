FROM archlinux
MAINTAINER Jacob Tye jacob.tye@outlook.com
RUN echo $user
RUN pacman -Syy
RUN pacman -S nodejs npm semver git base-devel fakeroot --noconfirm
ADD https://git.jacobtye.dev/api/v1/repos/Starkiller645/wolf-backend version.json
RUN pacman -Syyu --noconfirm
RUN mkdir -p /srv/lamb
RUN git clone https://git.jacobtye.dev/Starkiller645/wolf-backend /srv/lamb
WORKDIR /srv/lamb
RUN git fetch
RUN git pull
RUN echo '{ "team_name": "Team Solar", "team_tag": "TS", "team_members": [ "Microwabe", "Starkiller645", "PickleoDaRicko", "Meema09", "SGB2006", "Telstar112", "keyboard spams" ] }' > config.json
RUN echo "RGAPI-1d7e3380-12b8-42f5-81b9-0ea2da67dfc6" > apikey.txt
RUN npm install
RUN npm rebuild
CMD TERM=xterm-256color npm run clean-start 
EXPOSE 3080
