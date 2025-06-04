# Используем официальный SDK образ для билда
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
RUN dotnet nuget locals all --clear
# Копируем .csproj и восстанавливаем зависимости
COPY *.sln .
COPY api/*.csproj ./api/
RUN dotnet restore api/api.csproj

# Копируем остальной код и собираем
COPY api/. ./api/.
WORKDIR /app/api
RUN dotnet publish -c Release -o out

# Запускаем из runtime образа
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/api/out ./
ENTRYPOINT ["dotnet", "api.dll"]