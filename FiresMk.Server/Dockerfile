# Use the official .NET 8.0 SDK for build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Copy and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the remaining source code and build the application
COPY . ./
RUN dotnet publish -c Release -o out

# Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .

# Copy the Scripts directory to the runtime image
COPY --from=build-env /app/Scripts ./Scripts

# Install Python and required packages
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install pandas argparse numpy --break-system-packages

# Set entry point
ENTRYPOINT ["dotnet", "FiresMk.Server.dll"]

# Expose the port the app runs on
EXPOSE 8080

